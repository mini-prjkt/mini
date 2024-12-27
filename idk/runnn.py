from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from pymongo import MongoClient
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs

# Load the trained model
model = tf.keras.models.load_model("behavior_model.h5")
print("Model loaded successfully.")

# Initialize Flask app
app = Flask(__name__)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["authentication"]  # Replace with your database name
collection = db["users"]  # Replace with your collection name
print("Connected to MongoDB successfully.")

@app.route("/predict-same-or-not", methods=["POST"])
def predict_same_or_not():
    """
    Predict user consistency based on user data from MongoDB.
    Input JSON should include:
    {
        "user_id": "string"
    }
    """
    data = request.json
    if not "user_id" in data:
        return jsonify({"error": "Invalid input. Provide user_id."}), 400

    try:
        # Fetch user data from MongoDB
        user_id = data["user_id"]

        # Convert string to ObjectId
        try:
            user_object_id = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid ObjectId format."}), 400

        user_data = collection.find_one({"_id": user_object_id})
        if not user_data:
            return jsonify({"error": f"User with ID {user_id} not found."}), 404

        # Extract required fields from the user document
        avg_typing = user_data.get("behavioralData", {}).get("typingAverage", 200)  # Default average typing
        avg_scrolling = user_data.get("behavioralData", {}).get("scrollAverage", 300)  # Default average scrolling
        typing_speeds = user_data.get("behavioralData", {}).get("typingSpeeds", [])
        scrolling_speeds = user_data.get("behavioralData", {}).get("scrollSpeeds", [])

        # Assign default fallback value of 0.5 if arrays are empty
        latest_typing = typing_speeds[-1] if typing_speeds else 0.5
        latest_scrolling = scrolling_speeds[-1] if scrolling_speeds else 0.5

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
            "user_id": user_id,
            "prediction": prediction_label,
            "model_probability": float(model_prediction),
            "typing_deviation_absolute": typing_deviation_absolute,
            "scrolling_deviation_absolute": scrolling_deviation_absolute
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5003, debug=True)
