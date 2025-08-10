#!/bin/bash

# Oracle HCM Analysis Platform Startup Script

echo "🚀 Starting Oracle HCM Analysis Platform..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if required packages are installed
echo "🔍 Checking dependencies..."
python3 -c "import flask" 2>/dev/null || {
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
fi

# Check if Docker services are running
echo "🐳 Checking Docker services..."
if ! docker ps | grep -q "postgres"; then
    echo "⚠️  Warning: PostgreSQL container not running. Starting services..."
    docker-compose up -d postgres redis
    echo "⏳ Waiting for services to be ready..."
    sleep 10
fi

# Check database connection
echo "🔌 Testing database connection..."
python3 -c "
import sys
sys.path.append('.')
try:
    from app import app, db
    with app.app_context():
        db.engine.execute('SELECT 1')
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('💡 Make sure PostgreSQL is running and accessible')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database. Please check your configuration."
    exit 1
fi

# Start the Flask application
echo "🌐 Starting Flask application..."
echo "   Access the application at: http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
echo "   HCM Pages: http://localhost:5000/hcm-pages"
echo "   Press Ctrl+C to stop"
echo ""

# Set environment variables
export FLASK_ENV=development
export FLASK_DEBUG=True

python3 app.py