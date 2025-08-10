"""
Configuration management for Oracle HCM analysis.

This module handles all configuration settings including database connections,
analysis parameters, and system preferences.
"""

import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from pathlib import Path
import yaml
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class DatabaseConfig:
    """Database configuration settings."""
    url: str = ""
    host: str = "localhost"
    port: int = 5432
    database: str = "oracle_hcm_analysis"
    username: str = "hcm_user"
    password: str = "hcm_password"
    pool_size: int = 10
    max_overflow: int = 20
    echo: bool = False

@dataclass
class ScrapingConfig:
    """Web scraping configuration settings."""
    max_pages: int = 1000
    max_depth: int = 10
    request_delay: float = 1.0
    timeout: int = 30
    max_retries: int = 3
    user_agent: str = "Oracle-HCM-Analyzer/1.0"
    
    # Browser settings
    headless: bool = True
    browser_type: str = "chromium"  # chromium, firefox, webkit
    
    # Rate limiting
    requests_per_minute: int = 60
    concurrent_requests: int = 5

@dataclass
class AnalysisConfig:
    """Main analysis configuration settings."""
    # System identification
    system_name: str = "Oracle HCM Cloud"
    system_version: str = "23A"
    base_url: str = ""
    
    # Analysis scope
    modules_to_analyze: List[str] = field(default_factory=lambda: [
        "Core HR",
        "Workforce Management", 
        "Talent Management",
        "Compensation",
        "Benefits",
        "Payroll",
        "Time and Labor",
        "Absence Management"
    ])
    
    # Feature detection
    enable_feature_detection: bool = True
    enable_workflow_analysis: bool = True
    enable_security_analysis: bool = True
    enable_performance_analysis: bool = True
    
    # Best practices
    enable_best_practices: bool = True
    best_practice_categories: List[str] = field(default_factory=lambda: [
        "Security",
        "Performance",
        "Usability",
        "Compliance",
        "Integration",
        "Customization"
    ])
    
    # Documentation
    output_formats: List[str] = field(default_factory=lambda: ["html", "pdf", "markdown"])
    include_screenshots: bool = True
    include_code_examples: bool = True
    include_api_documentation: bool = True
    
    # Quality settings
    min_confidence_threshold: float = 0.7
    enable_validation: bool = True
    enable_approval_workflow: bool = False

@dataclass
class LoggingConfig:
    """Logging configuration settings."""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file_path: Optional[str] = None
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    backup_count: int = 5
    enable_console: bool = True
    enable_file: bool = True

@dataclass
class SecurityConfig:
    """Security configuration settings."""
    enable_ssl_verification: bool = True
    allowed_domains: List[str] = field(default_factory=list)
    blocked_patterns: List[str] = field(default_factory=list)
    session_timeout: int = 3600  # 1 hour
    max_login_attempts: int = 5
    password_policy: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PerformanceConfig:
    """Performance configuration settings."""
    enable_caching: bool = True
    cache_ttl: int = 3600  # 1 hour
    max_memory_usage: int = 1024 * 1024 * 1024  # 1GB
    enable_profiling: bool = False
    enable_metrics: bool = True

class ConfigManager:
    """
    Manages configuration for the Oracle HCM analysis system.
    
    This class handles loading, validation, and access to all configuration
    settings used throughout the system.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the configuration manager.
        
        Args:
            config_path: Path to configuration file (optional)
        """
        self.config_path = config_path or self._get_default_config_path()
        self.config = self._load_configuration()
        
    def _get_default_config_path(self) -> str:
        """Get the default configuration file path."""
        return os.path.join(os.getcwd(), "config", "analysis_config.yml")
    
    def _load_configuration(self) -> Dict[str, Any]:
        """Load configuration from file and environment variables."""
        config = self._get_default_config()
        
        # Load from file if it exists
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    file_config = yaml.safe_load(f)
                    config.update(file_config)
            except Exception as e:
                print(f"Warning: Could not load config file: {e}")
        
        # Override with environment variables
        config = self._override_with_env_vars(config)
        
        return config
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration values."""
        return {
            "database": {
                "url": os.getenv("DATABASE_URL", "postgresql://hcm_user:hcm_password@localhost:5432/oracle_hcm_analysis"),
                "host": os.getenv("DB_HOST", "localhost"),
                "port": int(os.getenv("DB_PORT", "5432")),
                "database": os.getenv("DB_NAME", "oracle_hcm_analysis"),
                "username": os.getenv("DB_USER", "hcm_user"),
                "password": os.getenv("DB_PASSWORD", "hcm_password"),
                "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),
                "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "20")),
                "echo": os.getenv("DB_ECHO", "false").lower() == "true"
            },
            "scraping": {
                "max_pages": int(os.getenv("MAX_PAGES", "1000")),
                "max_depth": int(os.getenv("MAX_DEPTH", "10")),
                "request_delay": float(os.getenv("REQUEST_DELAY", "1.0")),
                "timeout": int(os.getenv("TIMEOUT", "30")),
                "max_retries": int(os.getenv("MAX_RETRIES", "3")),
                "headless": os.getenv("HEADLESS", "true").lower() == "true",
                "browser_type": os.getenv("BROWSER_TYPE", "chromium"),
                "requests_per_minute": int(os.getenv("REQUESTS_PER_MINUTE", "60")),
                "concurrent_requests": int(os.getenv("CONCURRENT_REQUESTS", "5"))
            },
            "analysis": {
                "system_name": os.getenv("SYSTEM_NAME", "Oracle HCM Cloud"),
                "system_version": os.getenv("SYSTEM_VERSION", "23A"),
                "base_url": os.getenv("BASE_URL", ""),
                "enable_feature_detection": os.getenv("ENABLE_FEATURE_DETECTION", "true").lower() == "true",
                "enable_workflow_analysis": os.getenv("ENABLE_WORKFLOW_ANALYSIS", "true").lower() == "true",
                "enable_security_analysis": os.getenv("ENABLE_SECURITY_ANALYSIS", "true").lower() == "true",
                "min_confidence_threshold": float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.7"))
            },
            "logging": {
                "level": os.getenv("LOG_LEVEL", "INFO"),
                "enable_console": os.getenv("LOG_ENABLE_CONSOLE", "true").lower() == "true",
                "enable_file": os.getenv("LOG_ENABLE_FILE", "true").lower() == "true"
            },
            "security": {
                "enable_ssl_verification": os.getenv("ENABLE_SSL_VERIFICATION", "true").lower() == "true",
                "session_timeout": int(os.getenv("SESSION_TIMEOUT", "3600"))
            },
            "performance": {
                "enable_caching": os.getenv("ENABLE_CACHING", "true").lower() == "true",
                "cache_ttl": int(os.getenv("CACHE_TTL", "3600")),
                "enable_metrics": os.getenv("ENABLE_METRICS", "true").lower() == "true"
            }
        }
    
    def _override_with_env_vars(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Override configuration with environment variables."""
        # Database
        if os.getenv("DATABASE_URL"):
            config["database"]["url"] = os.getenv("DATABASE_URL")
        
        # Analysis
        if os.getenv("BASE_URL"):
            config["analysis"]["base_url"] = os.getenv("BASE_URL")
        
        return config
    
    def get_database_config(self) -> DatabaseConfig:
        """Get database configuration."""
        db_config = self.config.get("database", {})
        return DatabaseConfig(**db_config)
    
    def get_scraping_config(self) -> ScrapingConfig:
        """Get scraping configuration."""
        scraping_config = self.config.get("scraping", {})
        return ScrapingConfig(**scraping_config)
    
    def get_analysis_config(self) -> AnalysisConfig:
        """Get analysis configuration."""
        analysis_config = self.config.get("analysis", {})
        return AnalysisConfig(**analysis_config)
    
    def get_logging_config(self) -> LoggingConfig:
        """Get logging configuration."""
        logging_config = self.config.get("logging", {})
        return LoggingConfig(**logging_config)
    
    def get_security_config(self) -> SecurityConfig:
        """Get security configuration."""
        security_config = self.config.get("security", {})
        return SecurityConfig(**security_config)
    
    def get_performance_config(self) -> PerformanceConfig:
        """Get performance configuration."""
        performance_config = self.config.get("performance", {})
        return PerformanceConfig(**performance_config)
    
    def get_all_config(self) -> Dict[str, Any]:
        """Get all configuration as a dictionary."""
        return self.config
    
    def update_config(self, updates: Dict[str, Any]):
        """Update configuration with new values."""
        self.config.update(updates)
        
        # Save to file if possible
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                yaml.dump(self.config, f, default_flow_style=False)
        except Exception as e:
            print(f"Warning: Could not save config file: {e}")
    
    def validate_config(self) -> List[str]:
        """Validate configuration and return any errors."""
        errors = []
        
        # Check required fields
        if not self.config["analysis"]["base_url"]:
            errors.append("Base URL is required for analysis")
        
        if not self.config["database"]["url"]:
            errors.append("Database URL is required")
        
        # Check value ranges
        if self.config["scraping"]["max_pages"] <= 0:
            errors.append("Max pages must be greater than 0")
        
        if self.config["scraping"]["request_delay"] < 0:
            errors.append("Request delay cannot be negative")
        
        return errors

# Global configuration instance
config_manager = ConfigManager()

def get_config() -> ConfigManager:
    """Get the global configuration manager instance."""
    return config_manager