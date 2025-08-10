"""
Oracle HCM Documentation Generator
Main application for generating comprehensive documentation from analysis data
"""

import os
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from jinja2 import Environment, FileSystemLoader, Template
from datetime import datetime
import json

from analysis_engine import OracleHCMAnalyzer, AnalysisConfig, AnalysisSession

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentationGenerator:
    """Main documentation generator for Oracle HCM analysis"""
    
    def __init__(self, output_dir: str = "output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Setup Jinja2 environment
        self.template_dir = Path("docs/templates")
        self.env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Create output subdirectories
        self._setup_output_directories()
        
    def _setup_output_directories(self):
        """Create necessary output directories"""
        directories = [
            "html",
            "markdown", 
            "pdf",
            "assets/css",
            "assets/js",
            "assets/images"
        ]
        
        for directory in directories:
            (self.output_dir / directory).mkdir(parents=True, exist_ok=True)
    
    def generate_documentation(self, analysis_session: AnalysisSession) -> Dict[str, str]:
        """Generate all documentation formats from analysis session"""
        logger.info(f"Starting documentation generation for session {analysis_session.session_id}")
        
        try:
            # Copy static assets
            self._copy_static_assets()
            
            # Generate HTML documentation
            html_files = self._generate_html_documentation(analysis_session)
            
            # Generate Markdown documentation
            markdown_files = self._generate_markdown_documentation(analysis_session)
            
            # Generate PDF-ready HTML
            pdf_files = self._generate_pdf_documentation(analysis_session)
            
            # Generate executive summary
            executive_summary = self._generate_executive_summary(analysis_session)
            
            # Generate sitemap and navigation
            self._generate_navigation_files(analysis_session)
            
            # Generate analysis data JSON for API consumption
            self._generate_analysis_data_json(analysis_session)
            
            logger.info("Documentation generation completed successfully")
            
            return {
                "html": html_files,
                "markdown": markdown_files,
                "pdf": pdf_files,
                "executive_summary": executive_summary
            }
            
        except Exception as e:
            logger.error(f"Documentation generation failed: {str(e)}")
            raise
    
    def _copy_static_assets(self):
        """Copy static assets to output directory"""
        logger.info("Copying static assets...")
        
        # Copy CSS files
        css_source = Path("docs/static/styles.css")
        css_dest = self.output_dir / "assets/css/styles.css"
        if css_source.exists():
            css_dest.write_text(css_source.read_text())
            logger.info(f"Copied CSS to {css_dest}")
        
        # Copy JavaScript files
        js_source = Path("docs/static/script.js")
        js_dest = self.output_dir / "assets/js/main.js"
        if js_source.exists():
            js_dest.write_text(js_source.read_text())
            logger.info(f"Copied JavaScript to {js_dest}")
    
    def _generate_html_documentation(self, session: AnalysisSession) -> List[str]:
        """Generate HTML documentation files"""
        logger.info("Generating HTML documentation...")
        
        html_files = []
        
        # Generate main index page
        index_html = self._render_template("index.html.j2", session)
        index_path = self.output_dir / "html/index.html"
        index_path.write_text(index_html)
        html_files.append(str(index_path))
        logger.info(f"Generated main index: {index_path}")
        
        # Generate page detail pages
        for page in session.pages:
            page_html = self._render_template("page_detail.html.j2", {"page": page, "metadata": session.metadata})
            page_filename = f"page_{page.title.lower().replace(' ', '_').replace('-', '_')}.html"
            page_path = self.output_dir / "html" / page_filename
            page_path.write_text(page_html)
            html_files.append(str(page_path))
        
        # Generate feature detail pages
        for feature in session.features:
            feature_html = self._render_template("feature_detail.html.j2", {"feature": feature, "metadata": session.metadata})
            feature_filename = f"feature_{feature.name.lower().replace(' ', '_').replace('-', '_')}.html"
            feature_path = self.output_dir / "html" / feature_filename
            feature_path.write_text(feature_html)
            html_files.append(str(feature_path))
        
        # Generate best practice detail pages
        for bp in session.best_practices:
            bp_html = self._render_template("best_practice_detail.html.j2", {"best_practice": bp, "metadata": session.metadata})
            bp_filename = f"bp_{bp.title.lower().replace(' ', '_').replace('-', '_')}.html"
            bp_path = self.output_dir / "html" / bp_filename
            bp_path.write_text(bp_html)
            html_files.append(str(bp_path))
        
        logger.info(f"Generated {len(html_files)} HTML files")
        return html_files
    
    def _generate_markdown_documentation(self, session: AnalysisSession) -> List[str]:
        """Generate Markdown documentation files"""
        logger.info("Generating Markdown documentation...")
        
        markdown_files = []
        
        # Generate main README
        readme_md = self._render_template("README.md.j2", session)
        readme_path = self.output_dir / "markdown/README.md"
        readme_path.write_text(readme_md)
        markdown_files.append(str(readme_path))
        
        # Generate individual module reports
        modules = set(page.module for page in session.pages)
        for module in modules:
            module_pages = [p for p in session.pages if p.module == module]
            module_features = [f for f in session.features if any(p.title in f.name for p in module_pages)]
            module_bps = [bp for bp in session.best_practices if bp.category.lower() in module.lower()]
            
            module_data = {
                "module_name": module,
                "pages": module_pages,
                "features": module_features,
                "best_practices": module_bps,
                "metadata": session.metadata,
                "stats": session.stats
            }
            
            module_md = self._render_template("module_report.md.j2", module_data)
            module_filename = f"{module.lower().replace(' ', '_')}_report.md"
            module_path = self.output_dir / "markdown" / module_filename
            module_path.write_text(module_md)
            markdown_files.append(str(module_path))
        
        logger.info(f"Generated {len(markdown_files)} Markdown files")
        return markdown_files
    
    def _generate_pdf_documentation(self, session: AnalysisSession) -> List[str]:
        """Generate PDF-ready HTML documentation"""
        logger.info("Generating PDF-ready documentation...")
        
        pdf_files = []
        
        # Generate main PDF report
        pdf_html = self._render_template("pdf_main.html.j2", session)
        pdf_path = self.output_dir / "pdf/main_report.html"
        pdf_path.write_text(pdf_html)
        pdf_files.append(str(pdf_path))
        
        # Generate executive summary PDF
        exec_pdf_html = self._render_template("executive_summary.html.j2", session)
        exec_pdf_path = self.output_dir / "pdf/executive_summary.html"
        exec_pdf_path.write_text(exec_pdf_html)
        pdf_files.append(str(exec_pdf_path))
        
        logger.info(f"Generated {len(pdf_files)} PDF-ready HTML files")
        return pdf_files
    
    def _generate_executive_summary(self, session: AnalysisSession) -> str:
        """Generate executive summary HTML"""
        logger.info("Generating executive summary...")
        
        exec_html = self._render_template("executive_summary.html.j2", session)
        exec_path = self.output_dir / "html/executive_summary.html"
        exec_path.write_text(exec_html)
        
        logger.info(f"Generated executive summary: {exec_path}")
        return str(exec_path)
    
    def _generate_navigation_files(self, session: AnalysisSession):
        """Generate navigation and sitemap files"""
        logger.info("Generating navigation files...")
        
        # Generate sitemap
        sitemap = self._generate_sitemap(session)
        sitemap_path = self.output_dir / "html/sitemap.xml"
        sitemap_path.write_text(sitemap)
        
        # Generate navigation index
        nav_index = self._generate_navigation_index(session)
        nav_path = self.output_dir / "html/navigation.html"
        nav_path.write_text(nav_index)
        
        logger.info("Generated navigation files")
    
    def _generate_analysis_data_json(self, session: AnalysisSession):
        """Generate JSON data for API consumption"""
        logger.info("Generating analysis data JSON...")
        
        # Convert session to JSON-serializable format
        session_dict = self._session_to_dict(session)
        
        # Save full session data
        session_path = self.output_dir / "analysis_data.json"
        session_path.write_text(json.dumps(session_dict, indent=2, default=str))
        
        # Save individual data sets
        pages_path = self.output_dir / "pages.json"
        pages_path.write_text(json.dumps([self._page_to_dict(p) for p in session.pages], indent=2, default=str))
        
        features_path = self.output_dir / "features.json"
        features_path.write_text(json.dumps([self._feature_to_dict(f) for f in session.features], indent=2, default=str))
        
        best_practices_path = self.output_dir / "best_practices.json"
        best_practices_path.write_text(json.dumps([self._bp_to_dict(bp) for bp in session.best_practices], indent=2, default=str))
        
        logger.info("Generated analysis data JSON files")
    
    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render a Jinja2 template with given context"""
        try:
            template = self.env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {str(e)}")
            raise
    
    def _generate_sitemap(self, session: AnalysisSession) -> str:
        """Generate XML sitemap"""
        sitemap_template = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>index.html</loc>
        <lastmod>{timestamp}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>executive_summary.html</loc>
        <lastmod>{timestamp}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>""".format(timestamp=session.timestamp[:10])
        
        # Add page URLs
        for page in session.pages:
            page_filename = f"page_{page.title.lower().replace(' ', '_').replace('-', '_')}.html"
            sitemap_template += f"""
    <url>
        <loc>{page_filename}</loc>
        <lastmod>{page.last_updated}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>"""
        
        # Add feature URLs
        for feature in session.features:
            feature_filename = f"feature_{feature.name.lower().replace(' ', '_').replace('-', '_')}.html"
            sitemap_template += f"""
    <url>
        <loc>{feature_filename}</loc>
        <lastmod>{session.timestamp[:10]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>"""
        
        sitemap_template += """
</urlset>"""
        
        return sitemap_template
    
    def _generate_navigation_index(self, session: AnalysisSession) -> str:
        """Generate navigation index HTML"""
        nav_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Navigation Index - Oracle HCM Analysis Platform</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <div class="header">
        <h1>Navigation Index</h1>
        <p class="subtitle">Oracle HCM Analysis Platform</p>
    </div>
    
    <div class="container">
        <div class="section">
            <h2>Main Pages</h2>
            <ul>
                <li><a href="index.html">Main Overview</a></li>
                <li><a href="executive_summary.html">Executive Summary</a></li>
            </ul>
        </div>
        
        <div class="section">
            <h2>Pages by Module</h2>"""
        
        # Group pages by module
        modules = {}
        for page in session.pages:
            if page.module not in modules:
                modules[page.module] = []
            modules[page.module].append(page)
        
        for module, module_pages in modules.items():
            nav_template += f"""
            <h3>{module}</h3>
            <ul>"""
            for page in module_pages:
                page_filename = f"page_{page.title.lower().replace(' ', '_').replace('-', '_')}.html"
                nav_template += f"""
                <li><a href="{page_filename}">{page.title}</a></li>"""
            nav_template += """
            </ul>"""
        
        nav_template += """
        </div>
        
        <div class="section">
            <h2>Features</h2>
            <ul>"""
        
        for feature in session.features:
            feature_filename = f"feature_{feature.name.lower().replace(' ', '_').replace('-', '_')}.html"
            nav_template += f"""
                <li><a href="{feature_filename}">{feature.name}</a></li>"""
        
        nav_template += """
            </ul>
        </div>
        
        <div class="section">
            <h2>Best Practices</h2>
            <ul>"""
        
        for bp in session.best_practices:
            bp_filename = f"bp_{bp.title.lower().replace(' ', '_').replace('-', '_')}.html"
            nav_template += f"""
                <li><a href="{bp_filename}">{bp.title}</a></li>"""
        
        nav_template += """
            </ul>
        </div>
    </div>
    
    <footer class="footer">
        <p>&copy; 2024 Oracle HCM Analysis Platform</p>
        <p><a href="index.html">← Back to Overview</a></p>
    </footer>
</body>
</html>"""
        
        return nav_template
    
    def _session_to_dict(self, session: AnalysisSession) -> Dict[str, Any]:
        """Convert analysis session to dictionary"""
        return {
            "session_id": session.session_id,
            "timestamp": session.timestamp,
            "config": {
                "system_name": session.config.system_name,
                "system_version": session.config.system_version,
                "modules_to_analyze": session.config.modules_to_analyze,
                "analysis_depth": session.config.analysis_depth
            },
            "stats": {
                "total_pages": session.stats.total_pages,
                "total_features": session.stats.total_features,
                "total_best_practices": session.stats.total_best_practices,
                "average_complexity": session.stats.average_complexity,
                "roi_score": session.stats.roi_score
            },
            "metadata": session.metadata,
            "analysis_notes": session.analysis_notes,
            "recommendations_summary": session.recommendations_summary,
            "implementation_roadmap": session.implementation_roadmap
        }
    
    def _page_to_dict(self, page) -> Dict[str, Any]:
        """Convert page analysis to dictionary"""
        return {
            "title": page.title,
            "url": page.url,
            "module": page.module,
            "complexity_score": page.complexity_score,
            "load_time": page.load_time,
            "feature_count": page.feature_count,
            "business_criticality": page.business_criticality,
            "accessibility_score": page.accessibility_score,
            "mobile_friendly": page.mobile_friendly
        }
    
    def _feature_to_dict(self, feature) -> Dict[str, Any]:
        """Convert feature analysis to dictionary"""
        return {
            "name": feature.name,
            "category": feature.category,
            "complexity": feature.complexity,
            "business_value": feature.business_value,
            "implementation_effort": feature.implementation_effort,
            "risk_level": feature.risk_level
        }
    
    def _bp_to_dict(self, bp) -> Dict[str, Any]:
        """Convert best practice to dictionary"""
        return {
            "title": bp.title,
            "category": bp.category,
            "priority": bp.priority,
            "business_impact": bp.business_impact,
            "estimated_effort": bp.estimated_effort,
            "timeline": bp.timeline
        }


def main():
    """Main function to run the documentation generator"""
    logger.info("Starting Oracle HCM Documentation Generator")
    
    try:
        # Create analysis configuration
        config = AnalysisConfig(
            system_name="Oracle HCM Cloud",
            system_version="22C",
            modules_to_analyze=["Core HR", "Recruitment", "Performance", "Compensation", "Learning"],
            analysis_depth="comprehensive",
            include_performance_metrics=True,
            include_security_analysis=True,
            include_best_practices=True
        )
        
        # Run analysis
        logger.info("Running system analysis...")
        analyzer = OracleHCMAnalyzer(config)
        session = analyzer.analyze_system()
        
        # Generate documentation
        logger.info("Generating documentation...")
        generator = DocumentationGenerator()
        results = generator.generate_documentation(session)
        
        # Print summary
        print("\n" + "="*60)
        print("ORACLE HCM ANALYSIS PLATFORM - DOCUMENTATION GENERATED")
        print("="*60)
        print(f"System: {session.config.system_name}")
        print(f"Version: {session.config.system_version}")
        print(f"Analysis Session: {session.session_id}")
        print(f"Generated: {session.timestamp}")
        print("\nOutput Summary:")
        print(f"  HTML Files: {len(results['html'])}")
        print(f"  Markdown Files: {len(results['markdown'])}")
        print(f"  PDF-Ready Files: {len(results['pdf'])}")
        print(f"  Executive Summary: {results['executive_summary']}")
        print(f"\nAnalysis Results:")
        print(f"  Pages Analyzed: {session.stats.total_pages}")
        print(f"  Features Discovered: {session.stats.total_features}")
        print(f"  Best Practices: {session.stats.total_best_practices}")
        print(f"  Average Complexity: {session.stats.average_complexity}")
        print(f"  ROI Score: {session.stats.roi_score}")
        print(f"\nOutput Directory: {generator.output_dir.absolute()}")
        print("="*60)
        
    except Exception as e:
        logger.error(f"Documentation generation failed: {str(e)}")
        raise


if __name__ == "__main__":
    main()