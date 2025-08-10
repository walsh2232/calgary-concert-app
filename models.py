"""
Database models for Oracle HCM Analysis Platform
"""

from datetime import datetime

# Note: db will be imported from the main app
# from flask_sqlalchemy import SQLAlchemy
# db = SQLAlchemy()

class HCMPage:
    """HCM Page model for storing page information"""
    __tablename__ = 'hcm_pages'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<HCMPage {self.name}>'

class PageAnalysis:
    """Analysis results for HCM pages"""
    __tablename__ = 'page_analyses'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<PageAnalysis {self.analysis_type} for page {self.page_id}>'

class PageFeature:
    """Features found on HCM pages"""
    __tablename__ = 'page_features'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<PageFeature {self.feature_name}>'

class BestPractice:
    """Best practices and guidelines"""
    __tablename__ = 'best_practices'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<BestPractice {self.title}>'

class SystemMetrics:
    """System-wide metrics and statistics"""
    __tablename__ = 'system_metrics'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<SystemMetrics {self.metric_name}>'

class AnalysisConfiguration:
    """Configuration for analysis runs"""
    __tablename__ = 'analysis_configurations'
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __repr__(self):
        return f'<AnalysisConfiguration {self.name}>'