import pymongo
from bson import ObjectId  # Correct import for ObjectId
from collections import Counter

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

def fetch_user_interests(user_id):
    user = user_collection.find_one({"_id": user_id})
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
        if user['_id'] != user_id and user['_id'] not in excluded_users:  # Exclude the specified user and already friends
            common_interests = set(user_interests).intersection(set(interest_dict[str(interest)] for interest in user['interests']))
            top_users.append((user['_id'], len(common_interests)))
    
    top_users.sort(key=lambda x: x[1], reverse=True)
    
    return top_users[:n]


def main(user_id):
    user_interests = fetch_user_interests(user_id)
    if not user_interests:
        print("User not found or has no interests.")
        return
    
    users, interest_dict = fetch_users_and_interests()
    
    # Fetch friends of the user
    user = user_collection.find_one({"_id": user_id})
    friends = user.get('friends', [])
    
    top_users = get_top_users(user_id, user_interests, interest_dict, friends)  # Pass user_id, user_interests, and interest_dict
    
    print("Top 3 users with most common interests:")
    for user_id, common_interests_count in top_users:
        user = next((user for user in users if user['_id'] == user_id), None)
        if user:
            print(f"User ID: {user['_id']}, Username: {user['username']}, Common Interests Count: {common_interests_count}")

# Example: User ID (replace with actual user ID)
user_id = ObjectId("667da1ededc8f4170cf4753a")
main(user_id)

# Close the MongoDB connection
client.close()