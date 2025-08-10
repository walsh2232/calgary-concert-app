#!/bin/bash

# Oracle HCM Analysis Platform Setup Script

echo "🔧 Setting up Oracle HCM Analysis Platform..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Test database connection
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
    print('💡 Waiting a bit more for services to be fully ready...')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "⏳ Waiting additional time for services..."
    sleep 10
    
    python3 -c "
    import sys
    sys.path.append('.')
    try:
        from app import app, db
        with app.app_context():
            db.engine.execute('SELECT 1')
            print('✅ Database connection successful')
    except Exception as e:
        print(f'❌ Database connection still failed: {e}')
        sys.exit(1)
    "
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to connect to database after retry."
        echo "💡 Please check Docker services and try again:"
        echo "   docker-compose logs postgres"
        echo "   docker-compose logs redis"
        exit 1
    fi
fi

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "
import sys
sys.path.append('.')
try:
    from app import init_db
    init_db()
    print('✅ Database initialized successfully')
except Exception as e:
    print(f'❌ Database initialization failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database initialization failed."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Run the application: ./start.sh"
echo "   2. Access the platform: http://localhost:5000"
echo "   3. View HCM Pages: http://localhost:5000/hcm-pages"
echo "   4. Check health: http://localhost:5000/api/health"
echo ""
echo "🔧 Useful commands:"
echo "   - Start services: docker-compose up -d"
echo "   - Stop services: docker-compose down"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart app: ./start.sh"
echo ""
echo "📚 Documentation:"
echo "   - README.md: Project overview and features"
echo "   - HEALTH_CHECK_REPORT.md: System health status"
echo "   - DEMO_INSTRUCTIONS.md: How to demonstrate the platform"
echo ""