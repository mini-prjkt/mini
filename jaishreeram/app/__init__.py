from flask import Flask
from pymongo import MongoClient
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# MongoDB connection
mongo_client = MongoClient(app.config['MONGO_URI'])
db = mongo_client.get_database()

# Import routes
from app.routes.embedding import embedding_bp
from app.routes.anomaly import anomaly_bp

# Register Blueprints
app.register_blueprint(embedding_bp, url_prefix='/api/embedding')
app.register_blueprint(anomaly_bp, url_prefix='/api/anomaly')
