import numpy as np
from anomaly_model import anomaly_model

# Example test embedding
test_embedding = np.array([159.0, 36.45, 0.4, 0.61], dtype=np.float32).reshape(1, 1, -1)

# Test the prediction
def test_prediction():
    print("Testing prediction...")
    prediction = anomaly_model.predict(test_embedding)
    print(f"Prediction Output: {prediction}")
    if prediction[0][0] > 0.8:
        print("Anomaly detected!")
    else:
        print("User verified!")

# Test the model training
def test_training():
    print("Testing training...")
    anomaly_model.fit(test_embedding, np.array([0], dtype=np.float32), epochs=1, verbose=1)
    print("Model training completed successfully.")

if __name__ == "__main__":
    print("Starting model tests...")
    test_prediction()
    test_training()
    test_prediction()  # Re-run prediction after training
