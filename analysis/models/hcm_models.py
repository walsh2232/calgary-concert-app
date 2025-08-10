"""
Oracle HCM Data Models

This module defines all the data structures used for representing
HCM system components, features, and analysis results.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional, Any, Set
from enum import Enum
from uuid import UUID, uuid4

class FeatureType(Enum):
    """Types of HCM features."""
    FORM = "form"
    REPORT = "report"
    WORKFLOW = "workflow"
    INTEGRATION = "integration"
    SECURITY = "security"
    NAVIGATION = "navigation"
    SEARCH = "search"
    EXPORT = "export"
    IMPORT = "import"
    VALIDATION = "validation"
    NOTIFICATION = "notification"
    AUDIT = "audit"
    CONFIGURATION = "configuration"
    CUSTOMIZATION = "customization"

class PageType(Enum):
    """Types of HCM pages."""
    DASHBOARD = "dashboard"
    LIST = "list"
    DETAIL = "detail"
    FORM = "form"
    REPORT = "report"
    SEARCH = "search"
    ADMIN = "admin"
    CONFIG = "config"
    HELP = "help"

class ComplexityLevel(Enum):
    """Complexity levels for features and pages."""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

@dataclass
class HCMNavigation:
    """Represents navigation elements within HCM."""
    id: UUID = field(default_factory=uuid4)
    label: str = ""
    url: str = ""
    parent_id: Optional[UUID] = None
    children: List['HCMNavigation'] = field(default_factory=list)
    order: int = 0
    visible: bool = True
    permissions: List[str] = field(default_factory=list)

@dataclass
class HCMForm:
    """Represents a form within HCM."""
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    fields: List[Dict[str, Any]] = field(default_factory=list)
    validation_rules: List[str] = field(default_factory=list)
    required_fields: List[str] = field(default_factory=list)
    conditional_logic: List[Dict[str, Any]] = field(default_factory=list)
    form_type: str = ""
    complexity: ComplexityLevel = ComplexityLevel.BASIC

@dataclass
class HCMReport:
    """Represents a report within HCM."""
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    report_type: str = ""
    parameters: List[Dict[str, Any]] = field(default_factory=list)
    output_formats: List[str] = field(default_factory=list)
    schedule_options: List[str] = field(default_factory=list)
    access_controls: List[str] = field(default_factory=list)
    complexity: ComplexityLevel = ComplexityLevel.BASIC

@dataclass
class HCMWorkflow:
    """Represents a workflow within HCM."""
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    steps: List[Dict[str, Any]] = field(default_factory=list)
    conditions: List[Dict[str, Any]] = field(default_factory=list)
    participants: List[str] = field(default_factory=list)
    escalation_rules: List[str] = field(default_factory=list)
    complexity: ComplexityLevel = ComplexityLevel.BASIC

@dataclass
class HCMPage:
    """Represents a page within the HCM system."""
    id: UUID = field(default_factory=uuid4)
    url: str = ""
    title: str = ""
    description: str = ""
    page_type: PageType = PageType.DASHBOARD
    navigation_path: List[str] = field(default_factory=list)
    breadcrumbs: List[str] = field(default_factory=list)
    
    # Content analysis
    forms: List[HCMForm] = field(default_factory=list)
    reports: List[HCMReport] = field(default_factory=list)
    workflows: List[HCMWorkflow] = field(default_factory=list)
    
    # Metadata
    last_analyzed: Optional[datetime] = None
    analysis_version: str = "1.0"
    complexity_score: float = 0.0
    feature_count: int = 0
    
    # Technical details
    technologies_used: List[str] = field(default_factory=list)
    performance_metrics: Dict[str, Any] = field(default_factory=dict)
    accessibility_features: List[str] = field(default_factory=list)
    
    # Security and permissions
    required_permissions: List[str] = field(default_factory=list)
    security_features: List[str] = field(default_factory=list)
    
    # Links and references
    internal_links: List[str] = field(default_factory=list)
    external_links: List[str] = field(default_factory=list)
    api_endpoints: List[str] = field(default_factory=list)

@dataclass
class HCMFeature:
    """Represents a feature found within HCM."""
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    feature_type: FeatureType = FeatureType.FORM
    complexity: ComplexityLevel = ComplexityLevel.BASIC
    
    # Location and context
    page_id: Optional[UUID] = None
    page_url: str = ""
    navigation_path: List[str] = field(default_factory=list)
    
    # Feature details
    functionality: str = ""
    business_value: str = ""
    technical_implementation: str = ""
    
    # Configuration options
    configurable_options: List[str] = field(default_factory=list)
    default_settings: Dict[str, Any] = field(default_factory=dict)
    
    # Dependencies and relationships
    dependencies: List[str] = field(default_factory=list)
    related_features: List[str] = field(default_factory=list)
    
    # Usage and performance
    usage_patterns: List[str] = field(default_factory=list)
    performance_characteristics: Dict[str, Any] = field(default_factory=dict)
    
    # Documentation
    user_guide_url: Optional[str] = None
    admin_guide_url: Optional[str] = None
    api_documentation_url: Optional[str] = None
    
    # Analysis metadata
    discovered_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    analysis_confidence: float = 1.0

@dataclass
class HCMBestPractice:
    """Represents a best practice recommendation for HCM."""
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    description: str = ""
    category: str = ""
    priority: int = 1  # 1-5 scale
    
    # Context and applicability
    applicable_features: List[UUID] = field(default_factory=list)
    applicable_pages: List[UUID] = field(default_factory=list)
    business_context: str = ""
    
    # Implementation details
    implementation_steps: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    estimated_effort: str = ""
    
    # Benefits and impact
    benefits: List[str] = field(default_factory=list)
    business_impact: str = ""
    risk_mitigation: str = ""
    
    # References and resources
    oracle_documentation: List[str] = field(default_factory=list)
    industry_standards: List[str] = field(default_factory=list)
    case_studies: List[str] = field(default_factory=list)
    
    # Validation and approval
    validated_by: Optional[str] = None
    validation_date: Optional[datetime] = None
    approval_status: str = "pending"
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    version: str = "1.0"

@dataclass
class AnalysisSession:
    """Represents an analysis session."""
    id: UUID = field(default_factory=uuid4)
    system_url: str = ""
    start_time: datetime = field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    status: str = "running"  # running, completed, failed, cancelled
    
    # Results summary
    pages_discovered: int = 0
    features_analyzed: int = 0
    best_practices_generated: int = 0
    
    # Configuration used
    analysis_config: Dict[str, Any] = field(default_factory=dict)
    
    # Error tracking
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    # Performance metrics
    total_duration: Optional[float] = None
    memory_usage: Optional[float] = None
    cpu_usage: Optional[float] = None

@dataclass
class SystemConfiguration:
    """Represents HCM system configuration."""
    id: UUID = field(default_factory=uuid4)
    system_name: str = ""
    system_version: str = ""
    base_url: str = ""
    
    # Modules and features enabled
    enabled_modules: List[str] = field(default_factory=list)
    disabled_features: List[str] = field(default_factory=list)
    
    # Configuration details
    database_type: str = ""
    application_server: str = ""
    web_server: str = ""
    
    # Security configuration
    authentication_method: str = ""
    ssl_enabled: bool = True
    session_timeout: int = 30
    
    # Performance configuration
    cache_enabled: bool = True
    max_concurrent_users: int = 1000
    
    # Customization level
    customization_level: str = "standard"  # standard, moderate, heavy
    custom_objects: List[str] = field(default_factory=list)
    
    # Last updated
    last_updated: datetime = field(default_factory=datetime.now)
    updated_by: Optional[str] = None