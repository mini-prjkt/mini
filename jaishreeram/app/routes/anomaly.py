from flask import Blueprint, request, jsonify
from app.utils.database import get_user_by_id
from app.models.anomaly_model import anomaly_model
import numpy as np

anomaly_bp = Blueprint('anomaly', __name__)

@anomaly_bp.route('/check', methods=['POST'])
def check_anomaly():
    """Check for anomalies in user behavior."""
    try:
        # Debug: Log input request
        data = request.json
        print(f"Request Data: {data}")

        user_id = data.get('_id')
        typing_speeds = data.get('typingSpeeds', [])
        scrolling_speeds = data.get('scrollingSpeeds', [])

        # Validate input
        if not user_id:
            print("Error: User ID is required")
            return jsonify({'status': 'error', 'message': 'User ID is required'}), 400

        if not typing_speeds or not scrolling_speeds:
            print("Error: Typing and scrolling speeds are required")
            return jsonify({'status': 'error', 'message': 'Typing and scrolling speeds are required'}), 400

        # Fetch user from database
        user = get_user_by_id(user_id)
        if not user or 'embedding' not in user:
            print("Error: User not found or no embedding available")
            return jsonify({'status': 'error', 'message': 'User not found or no embedding available'}), 404

        # Debug: Log fetched user
        print(f"Fetched User: {user}")

        # Calculate new embedding
        new_embedding = [
            np.mean(typing_speeds),
            np.std(typing_speeds),
            np.mean(scrolling_speeds),
            np.std(scrolling_speeds)
        ]
        print(f"Calculated New Embedding: {new_embedding}")

        reshaped_embedding = np.array(new_embedding, dtype=np.float32).reshape(1, 1, -1)
        print(f"Reshaped Embedding for Model: {reshaped_embedding.shape}")

        # Make prediction with anomaly model
        prediction = anomaly_model.predict(reshaped_embedding)[0][0]
        print(f"Prediction: {prediction}")

        # Check prediction threshold
        if prediction > 0.8:  # Threshold for anomaly
            result = 'Anomaly detected: New User'
        else:
            anomaly_model.fit(reshaped_embedding, np.array([0], dtype=np.float32), epochs=1, verbose=0)
            result = 'User verified: Same User'

        # Return the result
        print(f"Result: {result}")
        return jsonify({'status': 'success', 'result': result})

    except Exception as e:
        # Error handling with logging
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
