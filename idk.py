import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# Function to generate synthetic data
def generate_data(samples=1000, percentage_threshold=0.2, absolute_typing_margin=60, absolute_scrolling_margin=60):
    """
    Generate synthetic training data for user behavior.

    Each sample consists of:
    [averageTypingSpeed, averageScrollingSpeed, latestTypingSpeed, latestScrollingSpeed]
    with labels 1 (Same User) or 0 (Not Same User).
    """
    data = []
    labels = []

    for _ in range(samples):
        # Generate average speeds (realistic ranges)
        avg_typing = np.random.uniform(150, 250)  # ms/keystroke
        avg_scrolling = np.random.uniform(250, 350)  # px/ms

        # Generate latest speeds
        latest_typing = avg_typing + np.random.uniform(-0.5, 0.5) * avg_typing
        latest_scrolling = avg_scrolling + np.random.uniform(-0.5, 0.5) * avg_scrolling

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
        data.append([avg_typing, avg_scrolling, latest_typing, latest_scrolling])
        labels.append(label)

    return np.array(data), np.array(labels)

# Generate training and testing datasets
data, labels = generate_data(samples=1000)
data = data.reshape(-1, 1, 4)  # Reshape for LSTM: (samples, timesteps, features)

# Split into training and testing sets
train_data, test_data = data[:800], data[800:]
train_labels, test_labels = labels[:800], labels[800:]

# Build the LSTM model
model = Sequential([
    LSTM(64, input_shape=(1, 4), return_sequences=False),
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

# Function for predictions considering both deviations and absolute margins
def predict_user_consistency_with_thresholds(
    avg_typing, avg_scrolling, latest_typing, latest_scrolling, 
    percentage_threshold=0.2, absolute_typing_margin=60, absolute_scrolling_margin=60
):
    """
    Predict if the user is the same based on combined deviations with thresholds.
    """
    # Calculate percentage deviations
    typing_deviation_percentage = abs(latest_typing - avg_typing) / avg_typing
    scrolling_deviation_percentage = abs(latest_scrolling - avg_scrolling) / avg_scrolling

    # Calculate absolute deviations
    typing_deviation_absolute = abs(latest_typing - avg_typing)
    scrolling_deviation_absolute = abs(latest_scrolling - avg_scrolling)

    print(f"Typing Deviation (Percentage): {typing_deviation_percentage:.2f}")
    print(f"Scrolling Deviation (Percentage): {scrolling_deviation_percentage:.2f}")
    print(f"Typing Deviation (Absolute): {typing_deviation_absolute:.2f} ms/keystroke")
    print(f"Scrolling Deviation (Absolute): {scrolling_deviation_absolute:.2f} px/ms")

    # Combine decision: BOTH deviations must be within thresholds
    if (typing_deviation_percentage <= percentage_threshold and typing_deviation_absolute <= absolute_typing_margin) and \
       (scrolling_deviation_percentage <= percentage_threshold and scrolling_deviation_absolute <= absolute_scrolling_margin):
        return "Same User"
    else:
        return "Not Same User"

# Example predictions
avg_typing = 1000
avg_scrolling = 300
latest_typing = 939  # Significant deviation
latest_scrolling = 300  # No deviation

result = predict_user_consistency_with_thresholds(
    avg_typing, avg_scrolling, latest_typing, latest_scrolling
)
print("Prediction:", result)
