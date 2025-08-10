"""
Oracle HCM System Analyzer

This module provides the main analysis engine for Oracle HCM systems.
It coordinates scraping, processing, and documentation generation.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from .scraper import HCMScraper
from .processor import HCMProcessor
from .documenter import HCMDocumenter
from ..models.hcm_models import HCMPage, HCMFeature, HCMBestPractice
from ..utils.config import AnalysisConfig
from ..utils.database import DatabaseManager

logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Container for analysis results."""
    pages_analyzed: int
    features_found: int
    best_practices_generated: int
    documentation_created: bool
    errors: List[str]
    start_time: datetime
    end_time: datetime
    total_duration: float

class HCMAnalyzer:
    """
    Main analyzer class for Oracle HCM systems.
    
    This class coordinates the entire analysis process including:
    - System discovery and page mapping
    - Feature extraction and analysis
    - Best practice generation
    - Documentation creation
    """
    
    def __init__(self, config: AnalysisConfig):
        """
        Initialize the HCM analyzer.
        
        Args:
            config: Configuration object containing analysis parameters
        """
        self.config = config
        self.scraper = HCMScraper(config)
        self.processor = HCMProcessor(config)
        self.documenter = HCMDocumenter(config)
        self.db_manager = DatabaseManager(config.database_url)
        
        # Analysis state
        self.analysis_in_progress = False
        self.current_analysis_id = None
        
    async def analyze_system(self, system_url: str, credentials: Dict[str, str]) -> AnalysisResult:
        """
        Perform comprehensive analysis of an Oracle HCM system.
        
        Args:
            system_url: Base URL of the HCM system
            credentials: Authentication credentials
            
        Returns:
            AnalysisResult containing analysis summary
        """
        if self.analysis_in_progress:
            raise RuntimeError("Analysis already in progress")
            
        start_time = datetime.now()
        self.analysis_in_progress = True
        
        try:
            logger.info(f"Starting HCM system analysis for: {system_url}")
            
            # Step 1: Discover and map system pages
            pages = await self._discover_pages(system_url, credentials)
            logger.info(f"Discovered {len(pages)} pages")
            
            # Step 2: Analyze each page for features
            features = await self._analyze_pages(pages)
            logger.info(f"Extracted {len(features)} features")
            
            # Step 3: Generate best practices
            best_practices = await self._generate_best_practices(features)
            logger.info(f"Generated {len(best_practices)} best practices")
            
            # Step 4: Create comprehensive documentation
            docs_created = await self._create_documentation(pages, features, best_practices)
            
            # Step 5: Store results in database
            await self._store_results(pages, features, best_practices)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = AnalysisResult(
                pages_analyzed=len(pages),
                features_found=len(features),
                best_practices_generated=len(best_practices),
                documentation_created=docs_created,
                errors=[],
                start_time=start_time,
                end_time=end_time,
                total_duration=duration
            )
            
            logger.info(f"Analysis completed successfully in {duration:.2f} seconds")
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
        finally:
            self.analysis_in_progress = False
    
    async def _discover_pages(self, system_url: str, credentials: Dict[str, str]) -> List[HCMPage]:
        """Discover all accessible pages in the HCM system."""
        try:
            pages = await self.scraper.discover_system_pages(system_url, credentials)
            return pages
        except Exception as e:
            logger.error(f"Page discovery failed: {str(e)}")
            raise
    
    async def _analyze_pages(self, pages: List[HCMPage]) -> List[HCMFeature]:
        """Analyze discovered pages to extract features."""
        features = []
        
        for page in pages:
            try:
                page_features = await self.processor.analyze_page(page)
                features.extend(page_features)
                logger.debug(f"Analyzed page {page.url}: {len(page_features)} features")
            except Exception as e:
                logger.error(f"Failed to analyze page {page.url}: {str(e)}")
                continue
                
        return features
    
    async def _generate_best_practices(self, features: List[HCMFeature]) -> List[HCMBestPractice]:
        """Generate best practices based on analyzed features."""
        try:
            best_practices = await self.processor.generate_best_practices(features)
            return best_practices
        except Exception as e:
            logger.error(f"Best practice generation failed: {str(e)}")
            raise
    
    async def _create_documentation(self, pages: List[HCMPage], 
                                  features: List[HCMFeature], 
                                  best_practices: List[HCMBestPractice]) -> bool:
        """Create comprehensive documentation."""
        try:
            await self.documenter.create_documentation(pages, features, best_practices)
            return True
        except Exception as e:
            logger.error(f"Documentation creation failed: {str(e)}")
            return False
    
    async def _store_results(self, pages: List[HCMPage], 
                           features: List[HCMFeature], 
                           best_practices: List[HCMBestPractice]):
        """Store analysis results in the database."""
        try:
            await self.db_manager.store_analysis_results(pages, features, best_practices)
            logger.info("Results stored in database successfully")
        except Exception as e:
            logger.error(f"Failed to store results: {str(e)}")
            raise
    
    async def get_analysis_status(self) -> Dict[str, Any]:
        """Get current analysis status."""
        return {
            "analysis_in_progress": self.analysis_in_progress,
            "current_analysis_id": self.current_analysis_id,
            "last_analysis_time": getattr(self, '_last_analysis_time', None)
        }
    
    async def stop_analysis(self):
        """Stop current analysis if running."""
        if self.analysis_in_progress:
            self.analysis_in_progress = False
            logger.info("Analysis stopped by user request")
        else:
            logger.info("No analysis currently running")