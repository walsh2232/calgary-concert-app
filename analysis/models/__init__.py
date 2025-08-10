"""
Data models for Oracle HCM analysis.

This package contains all the data structures and models used
throughout the analysis system.
"""

from .hcm_models import (
    HCMPage,
    HCMFeature,
    HCMBestPractice,
    HCMNavigation,
    HCMForm,
    HCMReport,
    HCMWorkflow
)

__all__ = [
    "HCMPage",
    "HCMFeature", 
    "HCMBestPractice",
    "HCMNavigation",
    "HCMForm",
    "HCMReport",
    "HCMWorkflow"
]