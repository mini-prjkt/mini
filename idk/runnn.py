from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf

# Load the trained model
model = tf.keras.models.load_model("behavior_model.h5")
print("Model loaded successfully.")

# Initialize Flask app
app = Flask(__name__)

@app.route("/predict-same-or-not", methods=["POST"])
def predict_same_or_not():
    """
    Predict user consistency based on provided vector.
    Input JSON should include:
    {
        "avg_typing": float,
        "avg_scrolling": float,
        "latest_typing": float,
        "latest_scrolling": float
    }
    """
    data = request.json
    # Validate input JSON
    if not all(key in data for key in ["avg_typing", "avg_scrolling", "latest_typing", "latest_scrolling"]):
        return jsonify({"error": "Invalid input. Provide avg_typing, avg_scrolling, latest_typing, and latest_scrolling."}), 400

    try:
        # Extract input values
        avg_typing = data["avg_typing"]
        avg_scrolling = data["avg_scrolling"]
        latest_typing = data["latest_typing"]
        latest_scrolling = data["latest_scrolling"]

        # Calculate deviations
        typing_deviation_absolute = abs(latest_typing - avg_typing)
        scrolling_deviation_absolute = abs(latest_scrolling - avg_scrolling)

        # Prepare data in the required shape for the model
        vector = np.array([[avg_typing, avg_scrolling, latest_typing, latest_scrolling]])
        vector = vector.reshape(-1, 1, 4)  # Reshape for LSTM

        # Model prediction
        model_prediction = model.predict(vector)[0][0]

        # Adjust thresholds dynamically
        typing_threshold = 60  # 50-60 ms/keystroke considered as acceptable deviation
        scrolling_threshold = 60  # Scrolling deviation threshold (adjust as per scrolling range)

        # Determine if it's the same user
        if typing_deviation_absolute <= typing_threshold and scrolling_deviation_absolute <= scrolling_threshold:
            prediction_label = "Same User"
        else:
            prediction_label = "Not Same User"

        return jsonify({
            "prediction": prediction_label,
            "model_probability": float(model_prediction)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5003, debug=True)
