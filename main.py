#!/usr/bin/env python3
"""
Oracle HCM Analysis Platform - Main Application
Complete system analysis and documentation generation workflow
"""

import sys
import logging
import argparse
from pathlib import Path
from datetime import datetime
import json

# Add src directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from analysis_engine import OracleHCMAnalyzer, AnalysisConfig
from documentation_generator import DocumentationGenerator
from utils.config_manager import ConfigManager
from utils.report_generator import ReportGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('oracle_hcm_analysis.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class OracleHCMMainApp:
    """Main application class for Oracle HCM Analysis Platform"""
    
    def __init__(self, config_file: str = None):
        self.config_manager = ConfigManager(config_file)
        self.config = self.config_manager.load_config()
        self.start_time = datetime.now()
        
    def run_analysis(self, config_overrides: dict = None) -> dict:
        """Run the complete analysis workflow"""
        logger.info("Starting Oracle HCM Analysis Platform")
        logger.info(f"Analysis started at: {self.start_time}")
        
        try:
            # Apply any config overrides
            if config_overrides:
                self.config.update(config_overrides)
            
            # Create analysis configuration
            analysis_config = AnalysisConfig(
                system_name=self.config.get('system_name', 'Oracle HCM Cloud'),
                system_version=self.config.get('system_version', '22C'),
                modules_to_analyze=self.config.get('modules_to_analyze', [
                    'Core HR', 'Recruitment', 'Performance', 'Compensation', 'Learning'
                ]),
                analysis_depth=self.config.get('analysis_depth', 'comprehensive'),
                include_performance_metrics=self.config.get('include_performance_metrics', True),
                include_security_analysis=self.config.get('include_security_analysis', True),
                include_best_practices=self.config.get('include_best_practices', True),
                custom_analysis_rules=self.config.get('custom_analysis_rules', {}),
                output_formats=self.config.get('output_formats', ['html', 'markdown', 'pdf'])
            )
            
            # Run system analysis
            logger.info("Running system analysis...")
            analyzer = OracleHCMAnalyzer(analysis_config)
            analysis_session = analyzer.analyze_system()
            
            # Generate documentation
            logger.info("Generating documentation...")
            doc_generator = DocumentationGenerator(
                output_dir=self.config.get('output_directory', 'output')
            )
            doc_results = doc_generator.generate_documentation(analysis_session)
            
            # Generate additional reports
            logger.info("Generating additional reports...")
            report_generator = ReportGenerator(
                output_dir=self.config.get('output_directory', 'output')
            )
            report_results = report_generator.generate_reports(analysis_session)
            
            # Compile results
            results = {
                'analysis_session': analysis_session,
                'documentation': doc_results,
                'reports': report_results,
                'execution_time': (datetime.now() - self.start_time).total_seconds(),
                'config_used': self.config,
                'timestamp': datetime.now().isoformat()
            }
            
            # Save results summary
            self._save_results_summary(results)
            
            logger.info("Analysis workflow completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Analysis workflow failed: {str(e)}")
            raise
    
    def _save_results_summary(self, results: dict):
        """Save a summary of the analysis results"""
        summary = {
            'execution_summary': {
                'start_time': self.start_time.isoformat(),
                'end_time': datetime.now().isoformat(),
                'execution_time_seconds': results['execution_time'],
                'status': 'completed'
            },
            'analysis_summary': {
                'system_name': results['analysis_session'].config.system_name,
                'system_version': results['analysis_session'].config.system_version,
                'total_pages': results['analysis_session'].stats.total_pages,
                'total_features': results['analysis_session'].stats.total_features,
                'total_best_practices': results['analysis_session'].stats.total_best_practices,
                'average_complexity': results['analysis_session'].stats.average_complexity,
                'roi_score': results['analysis_session'].stats.roi_score
            },
            'output_summary': {
                'html_files': len(results['documentation']['html']),
                'markdown_files': len(results['documentation']['markdown']),
                'pdf_files': len(results['documentation']['pdf']),
                'executive_summary': results['documentation']['executive_summary'],
                'additional_reports': len(results['reports'])
            }
        }
        
        summary_path = Path(self.config.get('output_directory', 'output')) / 'analysis_summary.json'
        summary_path.write_text(json.dumps(summary, indent=2, default=str))
        logger.info(f"Saved analysis summary to {summary_path}")
    
    def print_results_summary(self, results: dict):
        """Print a formatted summary of the analysis results"""
        print("\n" + "="*80)
        print("ORACLE HCM ANALYSIS PLATFORM - EXECUTION SUMMARY")
        print("="*80)
        
        # Execution Information
        print(f"Execution Time: {results['execution_time']:.2f} seconds")
        print(f"Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # System Information
        session = results['analysis_session']
        print(f"\nSystem: {session.config.system_name}")
        print(f"Version: {session.config.system_version}")
        print(f"Analysis Session: {session.session_id}")
        
        # Analysis Results
        print(f"\nAnalysis Results:")
        print(f"  Pages Analyzed: {session.stats.total_pages}")
        print(f"  Features Discovered: {session.stats.total_features}")
        print(f"  Best Practices: {session.stats.total_best_practices}")
        print(f"  Average Complexity: {session.stats.average_complexity:.2f}")
        print(f"  ROI Score: {session.stats.roi_score:.2f}")
        
        # Output Summary
        print(f"\nGenerated Output:")
        print(f"  HTML Files: {len(results['documentation']['html'])}")
        print(f"  Markdown Files: {len(results['documentation']['markdown'])}")
        print(f"  PDF-Ready Files: {len(results['documentation']['pdf'])}")
        print(f"  Executive Summary: {results['documentation']['executive_summary']}")
        print(f"  Additional Reports: {len(results['reports'])}")
        
        # Top Recommendations
        print(f"\nTop Recommendations:")
        high_priority_bps = [bp for bp in session.best_practices if bp.priority >= 4]
        for i, bp in enumerate(high_priority_bps[:5], 1):
            print(f"  {i}. {bp.title} (Priority: {bp.priority}/5)")
        
        # Performance Insights
        print(f"\nPerformance Insights:")
        slow_pages = [p for p in session.pages if p.load_time > 3.0]
        complex_pages = [p for p in session.pages if p.complexity_score > 0.7]
        print(f"  Pages with Load Time > 3s: {len(slow_pages)}")
        print(f"  High Complexity Pages: {len(complex_pages)}")
        
        # Output Directory
        output_dir = Path(self.config.get('output_directory', 'output'))
        print(f"\nOutput Directory: {output_dir.absolute()}")
        print("="*80)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Oracle HCM Analysis Platform',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                                    # Run with default config
  python main.py --config custom_config.yaml       # Run with custom config
  python main.py --output-dir custom_output        # Specify output directory
  python main.py --modules "Core HR,Recruitment"   # Analyze specific modules
        """
    )
    
    parser.add_argument(
        '--config', '-c',
        help='Configuration file path (default: config.yaml)',
        default='config.yaml'
    )
    
    parser.add_argument(
        '--output-dir', '-o',
        help='Output directory for generated files',
        default='output'
    )
    
    parser.add_argument(
        '--modules',
        help='Comma-separated list of modules to analyze',
        default='Core HR,Recruitment,Performance,Compensation,Learning'
    )
    
    parser.add_argument(
        '--depth',
        choices=['basic', 'standard', 'comprehensive'],
        help='Analysis depth level',
        default='comprehensive'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    parser.add_argument(
        '--quick',
        action='store_true',
        help='Run quick analysis (reduced depth)'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Handle quick mode
    if args.quick:
        args.depth = 'basic'
    
    try:
        # Create and run the main application
        app = OracleHCMMainApp(args.config)
        
        # Prepare config overrides
        config_overrides = {
            'output_directory': args.output_dir,
            'modules_to_analyze': [m.strip() for m in args.modules.split(',')],
            'analysis_depth': args.depth
        }
        
        # Run analysis
        results = app.run_analysis(config_overrides)
        
        # Print summary
        app.print_results_summary(results)
        
        # Exit successfully
        sys.exit(0)
        
    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"Application failed: {str(e)}")
        print(f"\nERROR: {str(e)}")
        print("Check the log file 'oracle_hcm_analysis.log' for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()