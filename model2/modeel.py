import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler

# Function to generate synthetic data
def generate_data(samples=1000, percentage_threshold=0.2, absolute_typing_margin=60, absolute_scrolling_margin=60):
    """
    Generate synthetic training data for user behavior.
    Each sample consists of:
    [averageTypingSpeed, averageScrollingSpeed, averageMessageLength, averagePunctuationFrequency,
     averageUppercaseRatio, averageLowercaseRatio, latestTypingSpeed, latestScrollingSpeed,
     latestMessageLength, latestPunctuationFrequency, latestUppercaseRatio, latestLowercaseRatio]
    with labels 1 (Same User) or 0 (Not Same User).
    """
    data = []
    labels = []

    for _ in range(samples):
        # Generate averages for each metric
        avg_typing = np.random.uniform(0, 1600)  # ms/keystroke
        avg_scrolling = np.random.uniform(0, 1600)  # px/ms
        avg_message_length = np.random.uniform(0, 100)  # characters
        avg_punctuation = np.random.uniform(0, 10)  # frequency per message
        avg_uppercase = np.random.uniform(0, 0.5)  # ratio
        avg_lowercase = np.random.uniform(0, 0.5)  # ratio

        # Generate latest values for each metric
        latest_typing = avg_typing + np.random.uniform(-0.5, 0.5) * avg_typing
        latest_scrolling = avg_scrolling + np.random.uniform(-0.5, 0.5) * avg_scrolling
        latest_message_length = avg_message_length + np.random.uniform(-0.5, 0.5) * avg_message_length
        latest_punctuation = avg_punctuation + np.random.uniform(-0.5, 0.5) * avg_punctuation
        latest_uppercase = avg_uppercase + np.random.uniform(-0.2, 0.2) * avg_uppercase
        latest_lowercase = avg_lowercase + np.random.uniform(-0.2, 0.2) * avg_lowercase

        # Calculate percentage deviations
        typing_deviation_percentage = abs(latest_typing - avg_typing) / avg_typing
        scrolling_deviation_percentage = abs(latest_scrolling - avg_scrolling) / avg_scrolling

        # Calculate absolute deviations
        typing_deviation_absolute = abs(latest_typing - avg_typing)
        scrolling_deviation_absolute = abs(latest_scrolling - avg_scrolling)

        # Label as 1 if BOTH typing and scrolling deviations are within thresholds
        label = 1 if (
            (typing_deviation_percentage <= percentage_threshold and typing_deviation_absolute <= absolute_typing_margin) and
            (scrolling_deviation_percentage <= percentage_threshold and scrolling_deviation_absolute <= absolute_scrolling_margin)
        ) else 0

        # Append to dataset
        data.append([
            avg_typing, avg_scrolling, avg_message_length, avg_punctuation,
            avg_uppercase, avg_lowercase, latest_typing, latest_scrolling,
            latest_message_length, latest_punctuation, latest_uppercase, latest_lowercase
        ])
        labels.append(label)

    return np.array(data), np.array(labels)

# Generate training and testing datasets
data, labels = generate_data(samples=1000)

# Normalize the data using Min-Max Scaling
scaler = MinMaxScaler()
data = scaler.fit_transform(data)

# Reshape data for LSTM: (samples, timesteps, features)
data = data.reshape(-1, 1, 12)

# Split into training and testing sets
train_data, test_data = data[:800], data[800:]
train_labels, test_labels = labels[:800], labels[800:]

# Build the LSTM model
model = Sequential([
    LSTM(64, input_shape=(1, 12), return_sequences=False),  # Updated input shape
    Dropout(0.3),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')  # Binary classification
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(
    train_data, train_labels,
    epochs=10,
    batch_size=16,
    validation_split=0.2
)

# Evaluate the model
test_loss, test_accuracy = model.evaluate(test_data, test_labels)
print(f"Test Accuracy: {test_accuracy:.2f}")

# Save the trained model
model.save("behavior_model.h5")
print("Model saved successfully.")
