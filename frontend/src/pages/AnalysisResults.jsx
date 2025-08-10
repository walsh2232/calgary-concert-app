import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  DownloadIcon,
  FilterIcon,
  CalendarIcon,
  ChartPieIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { hcmApi } from '../services/api';
import { HCMPage, AdvancedPageAnalysis, SystemHealthMetrics } from '../types/hcm';

const AnalysisResults: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<{
    pages: HCMPage[];
    systemHealth: SystemHealthMetrics | null;
    trends: any[];
    insights: any[];
  }>({
    pages: [],
    systemHealth: null,
    trends: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedPageType, setSelectedPageType] = useState('all');
  const [sortBy, setSortBy] = useState('performance');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedTimeRange]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      
      // Fetch pages with analysis data
      const pagesResponse = await hcmApi.getPages();
      let pages: HCMPage[] = [];
      if (pagesResponse.data.success) {
        pages = pagesResponse.data.data;
      }

      // Fetch system health
      const healthResponse = await hcmApi.getSystemHealth();
      let systemHealth: SystemHealthMetrics | null = null;
      if (healthResponse.data.success) {
        systemHealth = healthResponse.data.data;
      }

      // Generate mock trends and insights based on the data
      const trends = generateTrends(pages, selectedTimeRange);
      const insights = generateInsights(pages, systemHealth);

      setAnalysisData({
        pages,
        systemHealth,
        trends,
        insights
      });

    } catch (err) {
      setError('Error fetching analysis data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generateTrends = (pages: HCMPage[], timeRange: string) => {
    // Mock trend data - in a real app, this would come from historical analysis
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i - 1));
      
      const avgPerformance = pages.length > 0 
        ? pages.reduce((sum, page) => sum + page.performance.optimization_score, 0) / pages.length
        : 75;
      
      const avgSecurity = pages.length > 0
        ? pages.reduce((sum, page) => sum + page.security.overall_score, 0) / pages.length
        : 80;
      
      const avgAccessibility = pages.length > 0
        ? pages.reduce((sum, page) => sum + page.accessibility.overall_score, 0) / pages.length
        : 70;

      return {
        date: date.toISOString().split('T')[0],
        performance: avgPerformance + (Math.random() - 0.5) * 10,
        security: avgSecurity + (Math.random() - 0.5) * 8,
        accessibility: avgAccessibility + (Math.random() - 0.5) * 12,
        pagesAnalyzed: Math.floor(Math.random() * 20) + 10
      };
    });
  };

  const generateInsights = (pages: HCMPage[], systemHealth: SystemHealthMetrics | null) => {
    const insights = [];

    // Performance insights
    const lowPerformancePages = pages.filter(p => p.performance.optimization_score < 60);
    if (lowPerformancePages.length > 0) {
      insights.push({
        type: 'performance',
        priority: 'high',
        title: 'Performance Issues Detected',
        description: `${lowPerformancePages.length} pages have performance scores below 60%`,
        pages: lowPerformancePages.slice(0, 3),
        recommendation: 'Review and optimize these pages for better user experience'
      });
    }

    // Security insights
    const securityIssues = pages.filter(p => p.security.overall_score < 70);
    if (securityIssues.length > 0) {
      insights.push({
        type: 'security',
        priority: 'critical',
        title: 'Security Vulnerabilities Found',
        description: `${securityIssues.length} pages have security scores below 70%`,
        pages: securityIssues.slice(0, 3),
        recommendation: 'Immediate security review required for these pages'
      });
    }

    // Accessibility insights
    const accessibilityIssues = pages.filter(p => p.accessibility.overall_score < 65);
    if (accessibilityIssues.length > 0) {
      insights.push({
        type: 'accessibility',
        priority: 'medium',
        title: 'Accessibility Improvements Needed',
        description: `${accessibilityIssues.length} pages need accessibility improvements`,
        pages: accessibilityIssues.slice(0, 3),
        recommendation: 'Implement WCAG 2.1 AA compliance improvements'
      });
    }

    // Positive insights
    const highPerformingPages = pages.filter(p => p.performance.optimization_score > 90);
    if (highPerformingPages.length > 0) {
      insights.push({
        type: 'positive',
        priority: 'low',
        title: 'High Performance Pages',
        description: `${highPerformingPages.length} pages are performing excellently`,
        pages: highPerformingPages.slice(0, 3),
        recommendation: 'Use these pages as benchmarks for optimization'
      });
    }

    return insights;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <ChartBarIcon className="h-5 w-5" />;
      case 'security': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'accessibility': return <CheckCircleIcon className="h-5 w-5" />;
      case 'positive': return <TrendingUpIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const filteredPages = analysisData.pages.filter(page => {
    if (selectedPageType !== 'all' && page.page_type !== selectedPageType) {
      return false;
    }
    return true;
  });

  const sortedPages = [...filteredPages].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return b.performance.optimization_score - a.performance.optimization_score;
      case 'security':
        return b.security.overall_score - a.security.overall_score;
      case 'accessibility':
        return b.accessibility.overall_score - a.accessibility.overall_score;
      case 'complexity':
        return a.complexity_level.localeCompare(b.complexity_level);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchAnalysisData}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Comprehensive analysis insights and performance metrics for your Oracle HCM system
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchAnalysisData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Toggle */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TableCellsIcon className="h-4 w-4 inline mr-2" />
                Detailed View
              </button>
              <button
                onClick={() => setViewMode('trends')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'trends'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUpIcon className="h-4 w-4 inline mr-2" />
                Trends
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <select
                value={selectedPageType}
                onChange={(e) => setSelectedPageType(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Page Types</option>
                <option value="employee_self_service">Employee Self Service</option>
                <option value="manager_self_service">Manager Self Service</option>
                <option value="recruitment">Recruitment</option>
                <option value="payroll">Payroll</option>
                <option value="benefits">Benefits</option>
                <option value="learning">Learning</option>
                <option value="performance">Performance</option>
                <option value="talent">Talent</option>
                <option value="workforce">Workforce</option>
                <option value="admin">Administration</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="performance">Sort by Performance</option>
                <option value="security">Sort by Security</option>
                <option value="accessibility">Sort by Accessibility</option>
                <option value="complexity">Sort by Complexity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* System Health Summary */}
            {analysisData.systemHealth && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    System Health Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.systemHealth.overall_health_score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Health</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.systemHealth.performance_health.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.systemHealth.security_health.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Security</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisData.systemHealth.accessibility_health.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Accessibility</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Key Insights & Recommendations
                </h3>
                <div className="space-y-4">
                  {analysisData.insights.map((insight, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          <p className="text-sm mt-1">{insight.description}</p>
                          <p className="text-sm mt-2 font-medium">Recommendation:</p>
                          <p className="text-sm mt-1">{insight.recommendation}</p>
                          
                          {insight.pages.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Affected Pages:</p>
                              <div className="flex flex-wrap gap-2">
                                {insight.pages.map((page, pageIndex) => (
                                  <span
                                    key={pageIndex}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-75"
                                  >
                                    {page.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Performance Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Scores</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Excellent (90-100%)</span>
                        <span className="text-sm font-medium text-green-600">
                          {sortedPages.filter(p => p.performance.optimization_score >= 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Good (70-89%)</span>
                        <span className="text-sm font-medium text-blue-600">
                          {sortedPages.filter(p => p.performance.optimization_score >= 70 && p.performance.optimization_score < 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Needs Improvement (60-69%)</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {sortedPages.filter(p => p.performance.optimization_score >= 60 && p.performance.optimization_score < 70).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical (&lt;60%)</span>
                        <span className="text-sm font-medium text-red-600">
                          {sortedPages.filter(p => p.performance.optimization_score < 60).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Security Scores</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Secure (90-100%)</span>
                        <span className="text-sm font-medium text-green-600">
                          {sortedPages.filter(p => p.security.overall_score >= 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Good (70-89%)</span>
                        <span className="text-sm font-medium text-blue-600">
                          {sortedPages.filter(p => p.security.overall_score >= 70 && p.security.overall_score < 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Needs Review (60-69%)</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {sortedPages.filter(p => p.security.overall_score >= 60 && p.security.overall_score < 70).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vulnerable (&lt;60%)</span>
                        <span className="text-sm font-medium text-red-600">
                          {sortedPages.filter(p => p.security.overall_score < 60).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Accessibility Scores</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Compliant (90-100%)</span>
                        <span className="text-sm font-medium text-green-600">
                          {sortedPages.filter(p => p.accessibility.overall_score >= 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Good (70-89%)</span>
                        <span className="text-sm font-medium text-blue-600">
                          {sortedPages.filter(p => p.accessibility.overall_score >= 70 && p.accessibility.overall_score < 90).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Needs Work (60-69%)</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {sortedPages.filter(p => p.accessibility.overall_score >= 60 && p.accessibility.overall_score < 70).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Non-Compliant (&lt;60%)</span>
                        <span className="text-sm font-medium text-red-600">
                          {sortedPages.filter(p => p.accessibility.overall_score < 60).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View Mode */}
        {viewMode === 'detailed' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Detailed Analysis Results
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Security
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accessibility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complexity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Analyzed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{page.title}</div>
                              <div className="text-sm text-gray-500">{page.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {page.page_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              page.performance.optimization_score >= 80 ? 'text-green-600' :
                              page.performance.optimization_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {page.performance.optimization_score}%
                            </span>
                            {page.performance.optimization_score >= 80 ? 
                              <CheckCircleIcon className="h-4 w-4 text-green-500" /> :
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              page.security.overall_score >= 80 ? 'text-green-600' :
                              page.security.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {page.security.overall_score}%
                            </span>
                            {page.security.overall_score >= 80 ? 
                              <CheckCircleIcon className="h-4 w-4 text-green-500" /> :
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              page.accessibility.overall_score >= 80 ? 'text-green-600' :
                              page.accessibility.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {page.accessibility.overall_score}%
                            </span>
                            {page.accessibility.overall_score >= 80 ? 
                              <CheckCircleIcon className="h-4 w-4 text-green-500" /> :
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            page.complexity_level === 'low' ? 'bg-green-100 text-green-800' :
                            page.complexity_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {page.complexity_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(page.last_analyzed).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trends Mode */}
        {viewMode === 'trends' && (
          <div className="space-y-8">
            {/* Performance Trends */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Performance Trends Over Time
                </h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Performance trend chart would be displayed here</p>
                    <p className="text-xs text-gray-400">Showing data for the last {selectedTimeRange === '7d' ? '7 days' : selectedTimeRange === '30d' ? '30 days' : '90 days'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Trend</h4>
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-6 w-6 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">+5.2%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Improvement over selected period</p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Security Trend</h4>
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-6 w-6 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">+2.8%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Improvement over selected period</p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Accessibility Trend</h4>
                <div className="flex items-center space-x-2">
                  <TrendingDownIcon className="h-6 w-6 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">-1.5%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Decline over selected period</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;