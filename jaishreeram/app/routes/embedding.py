from flask import Blueprint, request, jsonify
from app.utils.database import get_user_by_id, update_user_embedding, fetch_all_user_ids
import numpy as np

embedding_bp = Blueprint('embedding', __name__)

@embedding_bp.route('/update', methods=['POST'])
def update_embedding():
    """Update user embedding."""
    data = request.json
    user_id = data.get('_id')
    typing_speeds = data.get('typingSpeeds', [])
    scrolling_speeds = data.get('scrollingSpeeds', [])

    if not user_id:
        return jsonify({'status': 'error', 'message': 'User ID is required'}), 400

    if not typing_speeds or not scrolling_speeds:
        return jsonify({'status': 'error', 'message': 'Typing and scrolling speeds are required'}), 400

    # Calculate embedding
    embedding = [
        np.mean(typing_speeds),
        np.std(typing_speeds),
        np.mean(scrolling_speeds),
        np.std(scrolling_speeds)
    ]
    result = update_user_embedding(user_id, embedding)
    if not result or result.matched_count == 0:
        return jsonify({'status': 'error', 'message': 'Failed to update embedding'}), 500

    return jsonify({'status': 'success', 'embedding': embedding})

@embedding_bp.route('/fetch', methods=['GET'])
def fetch_user_ids():
    """Fetch all user IDs."""
    user_ids = fetch_all_user_ids()
    return jsonify({'status': 'success', 'user_ids': user_ids})
