"""
Oracle HCM Documentation Generator

This module provides comprehensive documentation generation capabilities for
Oracle HCM systems, including HTML, PDF, and Markdown formats.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import json
import yaml

from jinja2 import Environment, FileSystemLoader, Template
from markdown import Markdown
import weasyprint

from ..analysis.models.hcm_models import (
    HCMPage, HCMFeature, HCMBestPractice, AnalysisSession
)
from ..utils.config import AnalysisConfig

logger = logging.getLogger(__name__)

class DocumentationGenerator:
    """
    Generates comprehensive documentation for Oracle HCM systems.
    
    This class creates detailed documentation in multiple formats including:
    - HTML with interactive navigation
    - PDF for printing and distribution
    - Markdown for version control and editing
    """
    
    def __init__(self, config: AnalysisConfig, output_dir: str = "generated_docs"):
        """
        Initialize the documentation generator.
        
        Args:
            config: Analysis configuration
            output_dir: Directory to store generated documentation
        """
        self.config = config
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Setup Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(self._get_template_dir()),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Setup Markdown processor
        self.md = Markdown(extensions=['extra', 'codehilite', 'toc'])
        
        # Documentation metadata
        self.metadata = {
            "title": f"Oracle {self.config.system_name} Analysis Report",
            "version": self.config.system_version,
            "generated_at": datetime.now().isoformat(),
            "analysis_config": self.config.__dict__
        }
    
    def _get_template_dir(self) -> str:
        """Get the directory containing documentation templates."""
        return os.path.join(os.path.dirname(__file__), "templates")
    
    async def generate_documentation(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession] = None
    ) -> Dict[str, str]:
        """
        Generate comprehensive documentation for the HCM system.
        
        Args:
            pages: List of analyzed HCM pages
            features: List of discovered features
            best_practices: List of best practice recommendations
            analysis_session: Analysis session information
            
        Returns:
            Dictionary mapping output format to file path
        """
        logger.info("Starting documentation generation...")
        
        try:
            # Create output directories
            self._create_output_directories()
            
            # Generate documentation in all formats
            results = {}
            
            # HTML documentation
            html_path = await self._generate_html_docs(pages, features, best_practices, analysis_session)
            results["html"] = str(html_path)
            
            # PDF documentation
            pdf_path = await self._generate_pdf_docs(pages, features, best_practices, analysis_session)
            results["pdf"] = str(pdf_path)
            
            # Markdown documentation
            md_path = await self._generate_markdown_docs(pages, features, best_practices, analysis_session)
            results["markdown"] = str(md_path)
            
            # Generate index and navigation
            await self._generate_navigation(pages, features, best_practices)
            
            # Copy static assets
            await self._copy_static_assets()
            
            logger.info(f"Documentation generation completed successfully")
            logger.info(f"Output files: {results}")
            
            return results
            
        except Exception as e:
            logger.error(f"Documentation generation failed: {str(e)}")
            raise
    
    def _create_output_directories(self):
        """Create necessary output directories."""
        directories = [
            self.output_dir / "html",
            self.output_dir / "pdf",
            self.output_dir / "markdown",
            self.output_dir / "assets",
            self.output_dir / "assets" / "css",
            self.output_dir / "assets" / "js",
            self.output_dir / "assets" / "images"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    async def _generate_html_docs(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> Path:
        """Generate HTML documentation."""
        logger.info("Generating HTML documentation...")
        
        # Main index page
        index_html = await self._generate_html_index(pages, features, best_practices, analysis_session)
        index_path = self.output_dir / "html" / "index.html"
        index_path.write_text(index_html)
        
        # Page documentation
        await self._generate_html_pages(pages)
        
        # Feature documentation
        await self._generate_html_features(features)
        
        # Best practices documentation
        await self._generate_html_best_practices(best_practices)
        
        # Analysis report
        if analysis_session:
            await self._generate_html_analysis_report(analysis_session)
        
        return self.output_dir / "html"
    
    async def _generate_html_index(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> str:
        """Generate the main HTML index page."""
        template = self.jinja_env.get_template("index.html.j2")
        
        # Prepare template data
        template_data = {
            "metadata": self.metadata,
            "pages": pages,
            "features": features,
            "best_practices": best_practices,
            "analysis_session": analysis_session,
            "stats": {
                "total_pages": len(pages),
                "total_features": len(features),
                "total_best_practices": len(best_practices),
                "modules_analyzed": self.config.modules_to_analyze
            }
        }
        
        return template.render(**template_data)
    
    async def _generate_html_pages(self, pages: List[HCMPage]):
        """Generate HTML documentation for individual pages."""
        template = self.jinja_env.get_template("page_detail.html.j2")
        
        for page in pages:
            try:
                # Generate page-specific data
                page_data = {
                    "page": page,
                    "metadata": self.metadata,
                    "related_features": [f for f in page.forms + page.reports + page.workflows],
                    "navigation_path": page.navigation_path,
                    "breadcrumbs": page.breadcrumbs
                }
                
                # Render template
                html_content = template.render(**page_data)
                
                # Create filename
                filename = f"page_{page.id}.html"
                file_path = self.output_dir / "html" / filename
                
                # Write file
                file_path.write_text(html_content)
                
                logger.debug(f"Generated HTML for page: {page.title}")
                
            except Exception as e:
                logger.error(f"Failed to generate HTML for page {page.title}: {str(e)}")
                continue
    
    async def _generate_html_features(self, features: List[HCMFeature]):
        """Generate HTML documentation for features."""
        template = self.jinja_env.get_template("feature_detail.html.j2")
        
        for feature in features:
            try:
                feature_data = {
                    "feature": feature,
                    "metadata": self.metadata,
                    "related_best_practices": [
                        bp for bp in best_practices 
                        if feature.id in bp.applicable_features
                    ] if 'best_practices' in locals() else []
                }
                
                html_content = template.render(**feature_data)
                
                filename = f"feature_{feature.id}.html"
                file_path = self.output_dir / "html" / filename
                file_path.write_text(html_content)
                
                logger.debug(f"Generated HTML for feature: {feature.name}")
                
            except Exception as e:
                logger.error(f"Failed to generate HTML for feature {feature.name}: {str(e)}")
                continue
    
    async def _generate_html_best_practices(self, best_practices: List[HCMBestPractice]):
        """Generate HTML documentation for best practices."""
        template = self.jinja_env.get_template("best_practice_detail.html.j2")
        
        for bp in best_practices:
            try:
                bp_data = {
                    "best_practice": bp,
                    "metadata": self.metadata,
                    "category": bp.category,
                    "priority": bp.priority
                }
                
                html_content = template.render(**bp_data)
                
                filename = f"best_practice_{bp.id}.html"
                file_path = self.output_dir / "html" / filename
                file_path.write_text(html_content)
                
                logger.debug(f"Generated HTML for best practice: {bp.title}")
                
            except Exception as e:
                logger.error(f"Failed to generate HTML for best practice {bp.title}: {str(e)}")
                continue
    
    async def _generate_pdf_docs(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> Path:
        """Generate PDF documentation."""
        logger.info("Generating PDF documentation...")
        
        try:
            # Generate main PDF report
            main_pdf = await self._generate_main_pdf(pages, features, best_practices, analysis_session)
            main_pdf_path = self.output_dir / "pdf" / "HCM_Analysis_Report.pdf"
            main_pdf_path.write_bytes(main_pdf)
            
            # Generate individual PDFs for major sections
            await self._generate_section_pdfs(pages, features, best_practices)
            
            return self.output_dir / "pdf"
            
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise
    
    async def _generate_main_pdf(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> bytes:
        """Generate the main PDF report."""
        # Create HTML content for PDF
        template = self.jinja_env.get_template("pdf_main.html.j2")
        
        template_data = {
            "metadata": self.metadata,
            "pages": pages,
            "features": features,
            "best_practices": best_practices,
            "analysis_session": analysis_session
        }
        
        html_content = template.render(**template_data)
        
        # Convert HTML to PDF
        pdf = weasyprint.HTML(string=html_content).write_pdf()
        return pdf
    
    async def _generate_markdown_docs(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> Path:
        """Generate Markdown documentation."""
        logger.info("Generating Markdown documentation...")
        
        try:
            # Main README
            readme_content = self._generate_markdown_readme(pages, features, best_practices, analysis_session)
            readme_path = self.output_dir / "markdown" / "README.md"
            readme_path.write_text(readme_content)
            
            # Page documentation
            await self._generate_markdown_pages(pages)
            
            # Feature documentation
            await self._generate_markdown_features(features)
            
            # Best practices documentation
            await self._generate_markdown_best_practices(best_practices)
            
            # Analysis report
            if analysis_session:
                await self._generate_markdown_analysis_report(analysis_session)
            
            return self.output_dir / "markdown"
            
        except Exception as e:
            logger.error(f"Markdown generation failed: {str(e)}")
            raise
    
    def _generate_markdown_readme(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice],
        analysis_session: Optional[AnalysisSession]
    ) -> str:
        """Generate the main README file in Markdown."""
        template = self.jinja_env.get_template("README.md.j2")
        
        template_data = {
            "metadata": self.metadata,
            "pages": pages,
            "features": features,
            "best_practices": best_practices,
            "analysis_session": analysis_session,
            "stats": {
                "total_pages": len(pages),
                "total_features": len(features),
                "total_best_practices": len(best_practices)
            }
        }
        
        return template.render(**template_data)
    
    async def _generate_navigation(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice]
    ):
        """Generate navigation and search functionality."""
        logger.info("Generating navigation and search...")
        
        # Create search index
        search_index = self._create_search_index(pages, features, best_practices)
        search_index_path = self.output_dir / "html" / "search-index.json"
        search_index_path.write_text(json.dumps(search_index, indent=2))
        
        # Create sitemap
        sitemap = self._create_sitemap(pages, features, best_practices)
        sitemap_path = self.output_dir / "html" / "sitemap.xml"
        sitemap_path.write_text(sitemap)
    
    def _create_search_index(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice]
    ) -> Dict[str, Any]:
        """Create a search index for the documentation."""
        search_index = {
            "pages": [],
            "features": [],
            "best_practices": []
        }
        
        # Index pages
        for page in pages:
            search_index["pages"].append({
                "id": str(page.id),
                "title": page.title,
                "url": f"page_{page.id}.html",
                "description": page.description,
                "type": page.page_type.value,
                "tags": page.navigation_path + [page.page_type.value]
            })
        
        # Index features
        for feature in features:
            search_index["features"].append({
                "id": str(feature.id),
                "name": feature.name,
                "url": f"feature_{feature.id}.html",
                "description": feature.description,
                "type": feature.feature_type.value,
                "tags": [feature.feature_type.value, feature.complexity.value]
            })
        
        # Index best practices
        for bp in best_practices:
            search_index["best_practices"].append({
                "id": str(bp.id),
                "title": bp.title,
                "url": f"best_practice_{bp.id}.html",
                "description": bp.description,
                "category": bp.category,
                "priority": bp.priority,
                "tags": [bp.category, f"priority-{bp.priority}"]
            })
        
        return search_index
    
    def _create_sitemap(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice]
    ) -> str:
        """Create an XML sitemap for the documentation."""
        sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        # Add main index
        sitemap += '  <url>\n'
        sitemap += '    <loc>index.html</loc>\n'
        sitemap += '    <lastmod>' + datetime.now().strftime('%Y-%m-%d') + '</lastmod>\n'
        sitemap += '    <priority>1.0</priority>\n'
        sitemap += '  </url>\n'
        
        # Add pages
        for page in pages:
            sitemap += '  <url>\n'
            sitemap += f'    <loc>page_{page.id}.html</loc>\n'
            sitemap += '    <lastmod>' + datetime.now().strftime('%Y-%m-%d') + '</lastmod>\n'
            sitemap += '    <priority>0.8</priority>\n'
            sitemap += '  </url>\n'
        
        # Add features
        for feature in features:
            sitemap += '  <url>\n'
            sitemap += f'    <loc>feature_{feature.id}.html</loc>\n'
            sitemap += '    <lastmod>' + datetime.now().strftime('%Y-%m-%d') + '</lastmod>\n'
            sitemap += '    <priority>0.7</priority>\n'
            sitemap += '  </url>\n'
        
        # Add best practices
        for bp in best_practices:
            sitemap += '  <url>\n'
            sitemap += f'    <loc>best_practice_{bp.id}.html</loc>\n'
            sitemap += '    <lastmod>' + datetime.now().strftime('%Y-%m-%d') + '</lastmod>\n'
            sitemap += '    <priority>0.9</priority>\n'
            sitemap += '  </url>\n'
        
        sitemap += '</urlset>'
        return sitemap
    
    async def _copy_static_assets(self):
        """Copy static assets (CSS, JS, images) to output directory."""
        logger.info("Copying static assets...")
        
        # This would copy CSS, JavaScript, and image files
        # For now, we'll create basic CSS
        css_content = self._generate_basic_css()
        css_path = self.output_dir / "assets" / "css" / "styles.css"
        css_path.write_text(css_content)
        
        # Basic JavaScript for search and navigation
        js_content = self._generate_basic_js()
        js_path = self.output_dir / "assets" / "js" / "main.js"
        js_path.write_text(js_content)
    
    def _generate_basic_css(self) -> str:
        """Generate basic CSS for the documentation."""
        return """
        /* Oracle HCM Analysis Platform Documentation Styles */
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #1f2937;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        
        .nav {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        
        .content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .feature-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .best-practice {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .search-box {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
        }
        """
    
    def _generate_basic_js(self) -> str:
        """Generate basic JavaScript for the documentation."""
        return """
        // Oracle HCM Analysis Platform Documentation JavaScript
        
        document.addEventListener('DOMContentLoaded', function() {
            // Search functionality
            const searchBox = document.getElementById('search-box');
            if (searchBox) {
                searchBox.addEventListener('input', function(e) {
                    const query = e.target.value.toLowerCase();
                    performSearch(query);
                });
            }
            
            // Navigation highlighting
            highlightCurrentPage();
        });
        
        function performSearch(query) {
            // Implement search functionality
            console.log('Searching for:', query);
        }
        
        function highlightCurrentPage() {
            // Highlight current page in navigation
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav a');
            
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.classList.add('active');
                }
            });
        }
        """
    
    async def generate_executive_summary(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice]
    ) -> str:
        """Generate an executive summary of the analysis."""
        template = self.jinja_env.get_template("executive_summary.html.j2")
        
        # Calculate key metrics
        total_pages = len(pages)
        total_features = len(features)
        total_best_practices = len(best_practices)
        
        # Group by complexity
        basic_features = len([f for f in features if f.complexity.value == "basic"])
        advanced_features = len([f for f in features if f.complexity.value in ["advanced", "expert"]])
        
        # Group best practices by priority
        high_priority_bp = len([bp for bp in best_practices if bp.priority >= 4])
        medium_priority_bp = len([bp for bp in best_practices if bp.priority == 3])
        low_priority_bp = len([bp for bp in best_practices if bp.priority <= 2])
        
        template_data = {
            "metadata": self.metadata,
            "stats": {
                "total_pages": total_pages,
                "total_features": total_features,
                "total_best_practices": total_best_practices,
                "basic_features": basic_features,
                "advanced_features": advanced_features,
                "high_priority_bp": high_priority_bp,
                "medium_priority_bp": medium_priority_bp,
                "low_priority_bp": low_priority_bp
            },
            "key_findings": self._extract_key_findings(pages, features, best_practices),
            "recommendations": self._extract_top_recommendations(best_practices)
        }
        
        return template.render(**template_data)
    
    def _extract_key_findings(
        self,
        pages: List[HCMPage],
        features: List[HCMFeature],
        best_practices: List[HCMBestPractice]
    ) -> List[str]:
        """Extract key findings from the analysis."""
        findings = []
        
        # Page complexity analysis
        complex_pages = [p for p in pages if p.complexity_score > 0.7]
        if complex_pages:
            findings.append(f"Found {len(complex_pages)} highly complex pages requiring special attention")
        
        # Feature distribution
        feature_types = {}
        for feature in features:
            feature_types[feature.feature_type.value] = feature_types.get(feature.feature_type.value, 0) + 1
        
        most_common_type = max(feature_types.items(), key=lambda x: x[1])
        findings.append(f"Most common feature type: {most_common_type[0]} ({most_common_type[1]} instances)")
        
        # Best practice coverage
        if best_practices:
            high_priority_count = len([bp for bp in best_practices if bp.priority >= 4])
            findings.append(f"Identified {high_priority_count} high-priority best practices for immediate implementation")
        
        return findings
    
    def _extract_top_recommendations(self, best_practices: List[HCMBestPractice]) -> List[Dict[str, Any]]:
        """Extract top recommendations from best practices."""
        # Sort by priority and return top 5
        sorted_bp = sorted(best_practices, key=lambda x: x.priority, reverse=True)
        
        top_recommendations = []
        for bp in sorted_bp[:5]:
            top_recommendations.append({
                "title": bp.title,
                "category": bp.category,
                "priority": bp.priority,
                "business_impact": bp.business_impact,
                "estimated_effort": bp.estimated_effort
            })
        
        return top_recommendations