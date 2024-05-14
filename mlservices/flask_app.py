from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Hardcoded list of languages
languages = [
    "english",
    "french",
    "spanish",
    "german",
    "italian"
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
def predict_language():
    input_language = request.json.get('text', '').lower()

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

    response = {'closest_language': closest_language}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7860)
