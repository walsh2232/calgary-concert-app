"""
Configuration Manager for Oracle HCM Analysis Platform
Handles loading and managing configuration files
"""

import os
import yaml
import json
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ConfigManager:
    """Manages configuration loading and validation for the Oracle HCM Analysis Platform"""
    
    def __init__(self, config_file: str = None):
        self.config_file = config_file or 'config.yaml'
        self.default_config = self._get_default_config()
        self.config = {}
        
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from file or create default"""
        try:
            if os.path.exists(self.config_file):
                logger.info(f"Loading configuration from {self.config_file}")
                self.config = self._load_yaml_config(self.config_file)
            else:
                logger.info(f"Configuration file {self.config_file} not found, using defaults")
                self.config = self.default_config.copy()
                self._save_default_config()
            
            # Validate configuration
            self._validate_config()
            
            # Merge with defaults for any missing keys
            self._merge_with_defaults()
            
            logger.info("Configuration loaded successfully")
            return self.config
            
        except Exception as e:
            logger.error(f"Failed to load configuration: {str(e)}")
            logger.info("Using default configuration")
            return self.default_config.copy()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration values"""
        return {
            # System Configuration
            'system_name': 'Oracle HCM Cloud',
            'system_version': '22C',
            'system_environment': 'Production',
            
            # Analysis Configuration
            'modules_to_analyze': [
                'Core HR',
                'Recruitment', 
                'Performance',
                'Compensation',
                'Learning',
                'Benefits',
                'Payroll',
                'Time and Labor',
                'Absence Management',
                'Workforce Management'
            ],
            'analysis_depth': 'comprehensive',  # basic, standard, comprehensive
            'include_performance_metrics': True,
            'include_security_analysis': True,
            'include_best_practices': True,
            'include_accessibility_analysis': True,
            'include_mobile_analysis': True,
            'include_seo_analysis': True,
            
            # Performance Thresholds
            'performance_thresholds': {
                'max_load_time': 3.0,  # seconds
                'max_complexity_score': 0.8,
                'min_accessibility_score': 0.8,
                'min_mobile_score': 0.7,
                'min_seo_score': 0.8
            },
            
            # Business Impact Scoring
            'business_impact_weights': {
                'user_count': 0.3,
                'transaction_volume': 0.25,
                'business_criticality': 0.25,
                'compliance_requirements': 0.2
            },
            
            # Output Configuration
            'output_directory': 'output',
            'output_formats': ['html', 'markdown', 'pdf'],
            'include_executive_summary': True,
            'include_detailed_reports': True,
            'include_api_data': True,
            
            # Custom Analysis Rules
            'custom_analysis_rules': {
                'page_complexity_factors': [
                    'form_count',
                    'report_count', 
                    'workflow_count',
                    'api_calls',
                    'javascript_complexity'
                ],
                'feature_importance_factors': [
                    'user_adoption',
                    'business_value',
                    'technical_complexity',
                    'maintenance_effort'
                ]
            },
            
            # Reporting Configuration
            'reporting': {
                'include_charts': True,
                'include_metrics': True,
                'include_recommendations': True,
                'include_roadmap': True,
                'max_recommendations_per_category': 10
            },
            
            # Security Analysis
            'security_analysis': {
                'check_authentication': True,
                'check_authorization': True,
                'check_data_encryption': True,
                'check_audit_logging': True,
                'check_compliance': True
            },
            
            # Performance Analysis
            'performance_analysis': {
                'check_load_times': True,
                'check_resource_usage': True,
                'check_database_performance': True,
                'check_api_response_times': True,
                'check_mobile_performance': True
            },
            
            # Best Practices Configuration
            'best_practices': {
                'categories': [
                    'Performance',
                    'Security',
                    'Usability',
                    'Accessibility',
                    'Mobile',
                    'Integration',
                    'Compliance',
                    'Maintenance'
                ],
                'priority_levels': 5,
                'effort_levels': ['Low', 'Medium', 'High'],
                'timeline_options': [
                    'Immediate (0-30 days)',
                    'Short-term (1-3 months)',
                    'Medium-term (3-6 months)',
                    'Long-term (6-12 months)',
                    'Strategic (12+ months)'
                ]
            },
            
            # Logging Configuration
            'logging': {
                'level': 'INFO',
                'file': 'oracle_hcm_analysis.log',
                'max_file_size': '10MB',
                'backup_count': 5,
                'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            },
            
            # API Configuration
            'api': {
                'enabled': False,
                'host': 'localhost',
                'port': 8000,
                'debug': False,
                'cors_enabled': True,
                'rate_limiting': True
            },
            
            # Database Configuration (if using external storage)
            'database': {
                'enabled': False,
                'type': 'sqlite',  # sqlite, postgresql, mysql
                'host': 'localhost',
                'port': 5432,
                'name': 'oracle_hcm_analysis',
                'user': '',
                'password': ''
            }
        }
    
    def _load_yaml_config(self, file_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
                return config or {}
        except yaml.YAMLError as e:
            logger.error(f"Invalid YAML in configuration file: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to read configuration file: {str(e)}")
            raise
    
    def _save_default_config(self):
        """Save default configuration to file"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as file:
                yaml.dump(self.default_config, file, default_flow_style=False, indent=2)
            logger.info(f"Default configuration saved to {self.config_file}")
        except Exception as e:
            logger.error(f"Failed to save default configuration: {str(e)}")
    
    def _validate_config(self):
        """Validate configuration values"""
        # Validate analysis depth
        valid_depths = ['basic', 'standard', 'comprehensive']
        if self.config.get('analysis_depth') not in valid_depths:
            logger.warning(f"Invalid analysis_depth: {self.config.get('analysis_depth')}. Using 'comprehensive'")
            self.config['analysis_depth'] = 'comprehensive'
        
        # Validate output formats
        valid_formats = ['html', 'markdown', 'pdf', 'json', 'xml']
        output_formats = self.config.get('output_formats', [])
        if not isinstance(output_formats, list):
            logger.warning("output_formats must be a list. Using default formats")
            self.config['output_formats'] = ['html', 'markdown', 'pdf']
        else:
            invalid_formats = [f for f in output_formats if f not in valid_formats]
            if invalid_formats:
                logger.warning(f"Invalid output formats: {invalid_formats}. Removing invalid formats")
                self.config['output_formats'] = [f for f in output_formats if f in valid_formats]
        
        # Validate performance thresholds
        thresholds = self.config.get('performance_thresholds', {})
        if not isinstance(thresholds, dict):
            logger.warning("performance_thresholds must be a dictionary. Using defaults")
            self.config['performance_thresholds'] = self.default_config['performance_thresholds']
        
        # Validate modules list
        modules = self.config.get('modules_to_analyze', [])
        if not isinstance(modules, list) or not modules:
            logger.warning("modules_to_analyze must be a non-empty list. Using defaults")
            self.config['modules_to_analyze'] = self.default_config['modules_to_analyze']
    
    def _merge_with_defaults(self):
        """Merge configuration with defaults for missing keys"""
        for key, default_value in self.default_config.items():
            if key not in self.config:
                self.config[key] = default_value
            elif isinstance(default_value, dict) and isinstance(self.config[key], dict):
                # Recursively merge nested dictionaries
                self._merge_dicts(self.config[key], default_value)
    
    def _merge_dicts(self, target: Dict[str, Any], source: Dict[str, Any]):
        """Recursively merge source dictionary into target"""
        for key, value in source.items():
            if key not in target:
                target[key] = value
            elif isinstance(value, dict) and isinstance(target[key], dict):
                self._merge_dicts(target[key], value)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any):
        """Set configuration value by key"""
        self.config[key] = value
    
    def update(self, updates: Dict[str, Any]):
        """Update configuration with new values"""
        self.config.update(updates)
        self._validate_config()
    
    def save_config(self, file_path: str = None):
        """Save current configuration to file"""
        file_path = file_path or self.config_file
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                yaml.dump(self.config, file, default_flow_style=False, indent=2)
            logger.info(f"Configuration saved to {file_path}")
        except Exception as e:
            logger.error(f"Failed to save configuration: {str(e)}")
    
    def export_json(self, file_path: str):
        """Export configuration to JSON format"""
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(self.config, file, indent=2, default=str)
            logger.info(f"Configuration exported to JSON: {file_path}")
        except Exception as e:
            logger.error(f"Failed to export configuration to JSON: {str(e)}")
    
    def get_analysis_config(self) -> Dict[str, Any]:
        """Get configuration specifically for analysis engine"""
        return {
            'system_name': self.config.get('system_name'),
            'system_version': self.config.get('system_version'),
            'modules_to_analyze': self.config.get('modules_to_analyze'),
            'analysis_depth': self.config.get('analysis_depth'),
            'include_performance_metrics': self.config.get('include_performance_metrics'),
            'include_security_analysis': self.config.get('include_security_analysis'),
            'include_best_practices': self.config.get('include_best_practices'),
            'performance_thresholds': self.config.get('performance_thresholds'),
            'custom_analysis_rules': self.config.get('custom_analysis_rules')
        }
    
    def get_output_config(self) -> Dict[str, Any]:
        """Get configuration specifically for output generation"""
        return {
            'output_directory': self.config.get('output_directory'),
            'output_formats': self.config.get('output_formats'),
            'include_executive_summary': self.config.get('include_executive_summary'),
            'include_detailed_reports': self.config.get('include_detailed_reports'),
            'include_api_data': self.config.get('include_api_data'),
            'reporting': self.config.get('reporting')
        }
    
    def validate_required_fields(self, required_fields: list) -> bool:
        """Validate that required configuration fields are present"""
        missing_fields = []
        for field in required_fields:
            if field not in self.config or self.config[field] is None:
                missing_fields.append(field)
        
        if missing_fields:
            logger.error(f"Missing required configuration fields: {missing_fields}")
            return False
        
        return True