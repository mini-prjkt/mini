# Use Python 3.9 slim as base image
FROM python:3.9-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements file to the working directory
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 8002 (the port on which your Flask app runs)
EXPOSE 8002

# Command to run the Flask application
CMD ["python", "flask_app.py"]
