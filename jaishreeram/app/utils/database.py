from app import db
from bson import ObjectId

def get_user_by_id(user_id):
    """Fetch a user by ID."""
    try:
        return db.users.find_one({'_id': ObjectId(user_id)})
    except Exception:
        return None

def update_user_embedding(user_id, embedding):
    """Update the embedding for a user."""
    try:
        return db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'embedding': embedding}}
        )
    except Exception:
        return None

def fetch_all_user_ids():
    """Fetch all user IDs."""
    users = db.users.find({}, {'_id': 1})
    return [str(user['_id']) for user in users]
