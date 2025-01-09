from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from pymongo import MongoClient
from bson import ObjectId

# Load the trained model
model = tf.keras.models.load_model("behavior_model.h5")
print("Model loaded successfully.")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS with credentials
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["authentication"]
collection = db["users"]
print("Connected to MongoDB successfully.")

@app.route("/predict-same-or-not", methods=["POST"])
def predict_same_or_not():
    data = request.json
    if not "user_id" in data:
        return jsonify({"error": "Invalid input. Provide user_id."}), 400

    try:
        user_id = data["user_id"]
        user_object_id = ObjectId(user_id)
        user_data = collection.find_one({"_id": user_object_id})
        if not user_data:
            return jsonify({"error": f"User with ID {user_id} not found."}), 404

        # Fetch averages and latest values for all behavioral metrics
        behavioral_data = user_data.get("behavioralData", {})
        
        avg_typing = behavioral_data.get("typingAverage", 200)
        avg_scrolling = behavioral_data.get("scrollAverage", 300)
        avg_message_length = behavioral_data.get("MessageLengthAverage", 0)
        avg_punctuation = behavioral_data.get("PunctuationAverage", 0)
        avg_uppercase = behavioral_data.get("UppercaseAverage", 0)
        avg_lowercase = behavioral_data.get("LowercaseAverage", 0)

        typing_speeds = behavioral_data.get("typingSpeeds", [])
        scrolling_speeds = behavioral_data.get("scrollSpeeds", [])
        message_lengths = behavioral_data.get("MessageLength", [])
        punctuation_frequencies = behavioral_data.get("PunctuationFrequency", [])
        uppercase_ratios = behavioral_data.get("UppercaseRatio", [])
        lowercase_ratios = behavioral_data.get("LowercaseRatio", [])

        latest_typing = typing_speeds[-1] if typing_speeds else 0.5
        latest_scrolling = scrolling_speeds[-1] if scrolling_speeds else 0.5
        latest_message_length = message_lengths[-1] if message_lengths else 0
        latest_punctuation = punctuation_frequencies[-1] if punctuation_frequencies else 0
        latest_uppercase_ratio = uppercase_ratios[-1] if uppercase_ratios else 0
        latest_lowercase_ratio = lowercase_ratios[-1] if lowercase_ratios else 0

        # Calculate deviations
        typing_deviation_absolute = abs(latest_typing - avg_typing)
        scrolling_deviation_absolute = abs(latest_scrolling - avg_scrolling)
        message_length_deviation_absolute = abs(latest_message_length - avg_message_length)
        punctuation_deviation_absolute = abs(latest_punctuation - avg_punctuation)
        uppercase_deviation_absolute = abs(latest_uppercase_ratio - avg_uppercase)
        lowercase_deviation_absolute = abs(latest_lowercase_ratio - avg_lowercase)

        # Create the feature vector
        vector = np.array([[avg_typing, avg_scrolling, avg_message_length, avg_punctuation,
                            avg_uppercase, avg_lowercase, latest_typing, latest_scrolling,
                            latest_message_length, latest_punctuation, latest_uppercase_ratio,
                            latest_lowercase_ratio]])
        vector = vector.reshape(-1, 1, 12)  # Reshape to match model input

        # Model prediction
        model_prediction = model.predict(vector)[0][0]

        # Define thresholds
        typing_threshold = 60
        scrolling_threshold = 60
        message_length_threshold = 20
        punctuation_threshold = 10
        uppercase_threshold = 0.2
        lowercase_threshold = 0.2

        # Determine prediction label
        if (typing_deviation_absolute <= typing_threshold and
            scrolling_deviation_absolute <= scrolling_threshold and
            message_length_deviation_absolute <= message_length_threshold and
            punctuation_deviation_absolute <= punctuation_threshold and
            uppercase_deviation_absolute <= uppercase_threshold and
            lowercase_deviation_absolute <= lowercase_threshold):
            prediction_label = "Same User"
        else:
            prediction_label = "Not Same User"

        return jsonify({
            "user_id": user_id,
            "prediction": prediction_label,
            "model_probability": float(model_prediction),
            "typing_deviation_absolute": typing_deviation_absolute,
            "scrolling_deviation_absolute": scrolling_deviation_absolute,
            "message_length_deviation_absolute": message_length_deviation_absolute,
            "punctuation_deviation_absolute": punctuation_deviation_absolute,
            "uppercase_deviation_absolute": uppercase_deviation_absolute,
            "lowercase_deviation_absolute": lowercase_deviation_absolute
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5003, debug=True)
