from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId  # Import for ObjectId
import tensorflow as tf
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# MongoDB Configuration
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["authentication"]  # Replace with your DB name
user_collection = db["users"]  # Replace with your collection name

# Load the TensorFlow model
model = tf.keras.models.load_model("user_behavior_model.h5")  # Path to saved model

# Threshold logic
def predict_user_consistency_with_thresholds(
    avg_typing, avg_scrolling, latest_typing, latest_scrolling, 
    percentage_threshold=0.2, absolute_typing_margin=60, absolute_scrolling_margin=60
):
    """
    Predict if the user is the same based on combined deviations with thresholds.
    """
    # Prevent division by zero
    if avg_typing == 0 or avg_scrolling == 0:
        return "Not Same User"

    # Calculate percentage deviations
    typing_deviation_percentage = abs(latest_typing - avg_typing) / avg_typing
    scrolling_deviation_percentage = abs(latest_scrolling - avg_scrolling) / avg_scrolling

    # Calculate absolute deviations
    typing_deviation_absolute = abs(latest_typing - avg_typing)
    scrolling_deviation_absolute = abs(latest_scrolling - avg_scrolling)

    if (typing_deviation_percentage <= percentage_threshold and typing_deviation_absolute <= absolute_typing_margin) and \
       (scrolling_deviation_percentage <= percentage_threshold and scrolling_deviation_absolute <= absolute_scrolling_margin):
        return "Same User"
    else:
        return "Not Same User"

@app.route('/predict-sameornot', methods=['POST'])
def predict_user_behavior():
    """
    Endpoint to predict user behavior based on vector values stored in MongoDB.
    """
    user_id = request.json.get('userId')  # User ID from the request body

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Convert userId to ObjectId
        object_id = ObjectId(user_id)
    except:
        return jsonify({"error": "Invalid userId format"}), 400

    # Fetch user data from MongoDB
    user_data = user_collection.find_one({"_id": object_id})
    if not user_data or "vector" not in user_data:
        return jsonify({"error": "User data or vector not found"}), 404

    vector = user_data["vector"]  # Retrieve the vector
    if len(vector) != 4:
        return jsonify({"error": "Vector length must be 4"}), 400

    avg_typing, avg_scrolling, latest_typing, latest_scrolling = vector

    # Threshold-based prediction
    threshold_result = predict_user_consistency_with_thresholds(
        avg_typing, avg_scrolling, latest_typing, latest_scrolling
    )

    # TensorFlow model prediction
    input_vector = np.array(vector).reshape(1, 1, 4)
    model_prediction = model.predict(input_vector)
    model_result = "Same User" if model_prediction[0][0] > 0.5 else "Not Same User"

    return jsonify({
        "userId": user_id,
        "vector": vector,
        "threshold_result": threshold_result,
        "model_result": model_result,
        "confidence": float(model_prediction[0][0])
    })

if __name__ == '__main__':
    app.run(debug=True, port=5002)
