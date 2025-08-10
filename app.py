#!/usr/bin/env python3
"""
Oracle HCM Analysis Platform - Web Application
Flask-based web interface for the Oracle HCM analysis system
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
from pathlib import Path
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'oracle-hcm-secret-key-2024'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/reports')
def reports():
    return render_template('reports.html')

@app.route('/api/run-analysis', methods=['POST'])
def run_analysis():
    try:
        data = request.get_json()
        logger.info(f"Received analysis request: {data}")
        
        # Mock analysis results for demo
        results = {
            'status': 'success',
            'message': 'Analysis completed successfully',
            'data': {
                'modules_analyzed': data.get('modules', ['Core HR', 'Recruitment']),
                'analysis_depth': data.get('depth', 'comprehensive'),
                'timestamp': '2024-01-15T10:30:00Z',
                'summary': {
                    'total_findings': 45,
                    'critical_issues': 3,
                    'warnings': 12,
                    'recommendations': 30
                }
            }
        }
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error running analysis: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/get-modules')
def get_modules():
    modules = [
        {'id': 'core-hr', 'name': 'Core HR', 'description': 'Human Resources core functionality'},
        {'id': 'recruitment', 'name': 'Recruitment', 'description': 'Talent acquisition and recruitment'},
        {'id': 'performance', 'name': 'Performance Management', 'description': 'Employee performance tracking'},
        {'id': 'compensation', 'name': 'Compensation', 'description': 'Salary and benefits management'},
        {'id': 'learning', 'name': 'Learning Management', 'description': 'Training and development'},
        {'id': 'workforce', 'name': 'Workforce Planning', 'description': 'Strategic workforce planning'},
        {'id': 'talent', 'name': 'Talent Management', 'description': 'Talent development and succession'},
        {'id': 'benefits', 'name': 'Benefits Administration', 'description': 'Employee benefits management'}
    ]
    return jsonify(modules)

@app.route('/api/get-analysis-history')
def get_analysis_history():
    history = [
        {
            'id': 1,
            'date': '2024-01-15',
            'modules': ['Core HR', 'Recruitment'],
            'status': 'completed',
            'findings': 45,
            'duration': '2h 15m'
        },
        {
            'id': 2,
            'date': '2024-01-10',
            'modules': ['Performance', 'Compensation'],
            'status': 'completed',
            'findings': 38,
            'duration': '1h 45m'
        },
        {
            'id': 3,
            'date': '2024-01-05',
            'modules': ['Learning', 'Workforce'],
            'status': 'completed',
            'findings': 52,
            'duration': '2h 30m'
        }
    ]
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
