#!/usr/bin/env python3
"""
Oracle HCM Analysis Platform - Main Application
"""

import logging
from datetime import datetime
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Load configuration
app.config.from_object(get_config())

# Initialize extensions
db = SQLAlchemy(app)
cache = Cache(app)

# Define models directly in app.py to avoid import issues
class HCMPage(db.Model):
    """HCM Page model for storing page information"""
    __tablename__ = 'hcm_pages'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), nullable=False, unique=True)
    page_type = db.Column(db.String(100), nullable=False)  # dashboard, form, list, etc.
    description = db.Column(db.Text)
    complexity = db.Column(db.String(50))  # low, medium, high
    features_count = db.Column(db.Integer, default=0)
    accessibility_score = db.Column(db.Float, default=0.0)
    performance_score = db.Column(db.Float, default=0.0)
    user_experience_score = db.Column(db.Float, default=0.0)
    overall_score = db.Column(db.Float, default=0.0)
    last_analyzed = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<HCMPage {self.name}>'

@app.route('/')
def index():
    """Main landing page"""
    return render_template('index.html')

@app.route('/hcm-pages')
def hcm_pages():
    """HCM Pages dashboard"""
    try:
        pages = HCMPage.query.all()
        return render_template('hcm_pages.html', pages=pages)
    except Exception as e:
        logger.error(f"Error loading HCM pages: {e}")
        return render_template('hcm_pages.html', pages=[])

@app.route('/api/hcm-pages')
def api_hcm_pages():
    """API endpoint to get all HCM pages"""
    try:
        pages = HCMPage.query.all()
        pages_data = []
        for page in pages:
            pages_data.append({
                'id': page.id,
                'name': page.name,
                'url': page.url,
                'type': page.page_type,
                'complexity': page.complexity,
                'features_count': page.features_count,
                'accessibility_score': page.accessibility_score,
                'performance_score': page.performance_score,
                'user_experience_score': page.user_experience_score,
                'overall_score': page.overall_score,
                'description': page.description,
                'last_analyzed': page.last_analyzed.isoformat() if page.last_analyzed else None
            })
        return jsonify({'status': 'success', 'data': pages_data})
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/init-db')
def init_db():
    """Initialize database with sample data"""
    try:
        # Create tables
        db.create_all()
        
        # Check if data already exists
        if HCMPage.query.first():
            return jsonify({'status': 'success', 'message': 'Database already initialized'})
        
        # Create sample HCM pages
        sample_pages = [
            HCMPage(
                name='Employee Self-Service Dashboard',
                url='/ess/dashboard',
                page_type='dashboard',
                complexity='medium',
                features_count=15,
                accessibility_score=85.5,
                performance_score=92.3,
                user_experience_score=88.7,
                overall_score=88.8,
                description='Main employee portal for accessing personal information, benefits, and time tracking.',
                last_analyzed=datetime.utcnow()
            ),
            HCMPage(
                name='Manager Approval Workflow',
                url='/manager/approvals',
                page_type='form',
                complexity='high',
                features_count=22,
                accessibility_score=78.2,
                performance_score=85.1,
                user_experience_score=82.4,
                overall_score=81.9,
                description='Complex workflow for managers to approve various employee requests and changes.',
                last_analyzed=datetime.utcnow()
            ),
            HCMPage(
                name='Recruitment Candidate List',
                url='/recruitment/candidates',
                page_type='list',
                complexity='low',
                features_count=8,
                accessibility_score=91.8,
                performance_score=94.5,
                user_experience_score=89.2,
                overall_score=91.8,
                description='Simple list view of recruitment candidates with basic filtering and sorting.',
                last_analyzed=datetime.utcnow()
            ),
            HCMPage(
                name='Performance Review Form',
                url='/performance/review',
                page_type='form',
                complexity='high',
                features_count=18,
                accessibility_score=76.5,
                performance_score=83.7,
                user_experience_score=79.8,
                overall_score=80.0,
                description='Comprehensive performance review form with multiple sections and validation.',
                last_analyzed=datetime.utcnow()
            ),
            HCMPage(
                name='Benefits Enrollment',
                url='/benefits/enroll',
                page_type='form',
                complexity='medium',
                features_count=12,
                accessibility_score=82.1,
                performance_score=88.9,
                user_experience_score=85.3,
                overall_score=85.4,
                description='Benefits enrollment form with plan selection and dependent management.',
                last_analyzed=datetime.utcnow()
            )
        ]
        
        # Add to database
        for page in sample_pages:
            db.session.add(page)
        
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Database initialized with sample data'})
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection with a more SQLite-friendly approach
        db.session.execute(db.text('SELECT 1'))
        db_status = 'healthy'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = 'unhealthy'
    
    # Test cache
    try:
        cache.set('health_test', 'ok', timeout=10)
        cache_status = 'healthy' if cache.get('health_test') == 'ok' else 'unhealthy'
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        cache_status = 'unhealthy'
    
    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'degraded',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': db_status,
            'cache': cache_status
        },
        'version': '1.0.0'
    })

def init_db():
    """Initialize database (for CLI use)"""
    with app.app_context():
        db.create_all()
        logger.info("Database tables created")

if __name__ == '__main__':
    # Initialize database on startup
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    # Start the application
    app.run(
        host=app.config.get('FLASK_HOST', '0.0.0.0'),
        port=int(app.config.get('FLASK_PORT', 5000)),
        debug=app.config.get('DEBUG', False)
    )
