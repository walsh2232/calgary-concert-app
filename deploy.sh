#!/bin/bash

echo "Oracle HCM Analysis Platform - Deployment Script"
echo "================================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is required but not installed."
    exit 1
fi

echo "Installing dependencies..."
pip3 install -r requirements.txt

echo "Setting up environment..."
export FLASK_APP=app.py
export FLASK_ENV=production

echo "Starting the application..."
echo "The application will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py
