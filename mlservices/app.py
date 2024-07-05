from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from difflib import SequenceMatcher
import pymongo
from bson import ObjectId  # Correct import for ObjectId
from collections import Counter

app = Flask(__name__)
CORS(app, supports_credentials=True)

# MongoDB connection details
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "authentication"  # Use 'authentication' as the database name for connecting
USER_COLLECTION = "users"
INTEREST_COLLECTION = "interests"

# Connect to MongoDB
client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
user_collection = db[USER_COLLECTION]
interest_collection = db[INTEREST_COLLECTION]

# Hardcoded list of languages
languages = [
    "english",
    "french",
    "spanish",
    "german",
    "italian",
    "Kannada",
    "Telugu",
    "Tamil",
    "Malayalam",
    "Hindi"
]

# Tokenize the languages
tokenizer = tf.keras.preprocessing.text.Tokenizer()
tokenizer.fit_on_texts(languages)
sequences = tokenizer.texts_to_sequences(languages)

# Convert tokenized sequences to vectors
max_len = max(len(seq) for seq in sequences)
padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences, maxlen=max_len, padding='post')
vectors = tf.constant(padded_sequences)

@app.route('/predict', methods=['POST'])
def process_request():
    data = request.json
    
    if 'text' in data:
        return predict_language(data)
    elif 'user_id' in data:
        return top_users_by_interests(data)
    else:
        return jsonify({'error': 'Invalid request format'}), 400

def predict_language(data):
    input_language = data.get('text', '').lower()

    # Tokenize the input language
    input_sequence = tokenizer.texts_to_sequences([input_language])
    input_vector = tf.keras.preprocessing.sequence.pad_sequences(input_sequence, maxlen=max_len, padding='post')

    # Calculate cosine similarity
    similarities = []
    input_vector_value = input_vector  # No need to convert to numpy array
    for lang_vector in vectors:  # No need to convert vectors to numpy array
        dot_product = np.sum(np.multiply(input_vector_value[0], lang_vector))
        magnitude = np.sqrt(np.sum(np.square(input_vector_value[0]))) * np.sqrt(np.sum(np.square(lang_vector)))
        cosine_similarity = dot_product / magnitude
        similarities.append(cosine_similarity)

    # Find the closest language
    closest_language_index = np.argmax(similarities)
    closest_language = languages[closest_language_index]

    # If no exact match, find closest using string similarity
    if closest_language.lower() != input_language:
        closest_matches = sorted(languages, key=lambda x: SequenceMatcher(None, x.lower(), input_language).ratio(), reverse=True)
        closest_language = closest_matches[0]

    response = {
        'closest_language': closest_language
    }
    return jsonify(response)

def top_users_by_interests(data):
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # Fetch user interests
    user_interests = fetch_user_interests(user_id)
    if not user_interests:
        return jsonify({'error': 'User not found or has no interests'}), 404

    # Fetch all users and interests
    users, interest_dict = fetch_users_and_interests()

    # Fetch friends of the user
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    friends = user.get('friends', [])

    # Get top users with common interests
    top_users = get_top_users(user_id, user_interests, interest_dict, friends)

    # Format response
    top_users_info = []
    for user_id, common_interests_count in top_users:
        user = next((user for user in users if str(user['_id']) == user_id), None)
        if user:
            top_users_info.append({
                'user_id': str(user['_id']),
                'username': user['username'],
                'common_interests_count': common_interests_count
            })

    response = {
        'top_users': top_users_info
    }
    return jsonify(response)

# MongoDB operations
def fetch_user_interests(user_id):
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        interests = [interest_collection.find_one({"_id": interest_id})['name'] for interest_id in user.get('interests', [])]
        return interests
    else:
        return []

def fetch_users_and_interests():
    users = list(user_collection.find({}))
    interests = list(interest_collection.find({}))
    
    # Create a dictionary of interests for easy lookup
    interest_dict = {str(interest['_id']): interest['name'] for interest in interests}
    
    return users, interest_dict

def get_top_users(user_id, user_interests, interest_dict, excluded_users, n=3):
    all_users = list(user_collection.find({}))
    top_users = []
    
    for user in all_users:
        if str(user['_id']) != user_id and str(user['_id']) not in excluded_users:  # Exclude the specified user and already friends
            common_interests = set(user_interests).intersection(set(interest_dict[str(interest)] for interest in user.get('interests', [])))
            top_users.append((str(user['_id']), len(common_interests)))
    
    top_users.sort(key=lambda x: x[1], reverse=True)
    
    return top_users[:n]

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7860)

# Close MongoDB connection
client.close()