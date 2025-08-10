import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { HCMPage, AdvancedPageAnalysis } from '../types/hcm';

interface HCMPageDetailProps {
  page: HCMPage | null;
  isOpen: boolean;
  onClose: () => void;
}

const HCMPageDetail: React.FC<HCMPageDetailProps> = ({ page, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  if (!page || !isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'accessibility', name: 'Accessibility', icon: UserGroupIcon },
    { id: 'forms', name: 'Forms & Fields', icon: CogIcon },
    { id: 'analysis', name: 'Analysis Details', icon: InformationCircleIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-500">{page.page_type} • {page.complexity_level} complexity</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {showAdvancedMetrics ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
                  {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Page Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Performance Score</h4>
                    <div className="flex items-center">
                      <span className={`text-2xl font-bold ${getHealthColor(page.performance.optimization_score)}`}>
                        {page.performance.optimization_score}%
                      </span>
                      {getHealthIcon(page.performance.optimization_score)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Forms Count</h4>
                    <div className="text-2xl font-bold text-gray-900">{page.forms.length}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Last Analyzed</h4>
                    <div className="text-sm text-gray-900">
                      {new Date(page.last_analyzed).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Page Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{page.description || 'No description available.'}</p>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Re-analyze
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Export Report
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Trends
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Optimization Score</span>
                        <span className={`font-medium ${getHealthColor(page.performance.optimization_score)}`}>
                          {page.performance.optimization_score}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Load Time</span>
                        <span className="font-medium text-gray-900">{page.performance.load_time}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="font-medium text-gray-900">{page.performance.response_time}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="font-medium text-gray-900">{page.performance.memory_usage}MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Issues */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Performance Issues</h4>
                    <div className="space-y-2">
                      {page.performance.issues && page.performance.issues.length > 0 ? (
                        page.performance.issues.map((issue, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded-md">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-red-800 font-medium">{issue.title}</p>
                              <p className="text-xs text-red-600">{issue.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-800">No performance issues detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Recommendations */}
                {page.performance.recommendations && page.performance.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Optimization Recommendations</h4>
                    <div className="space-y-2">
                      {page.performance.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <h5 className="text-sm font-medium text-blue-800">{rec.title}</h5>
                          <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                          {rec.impact && (
                            <p className="text-xs text-blue-600 mt-2">
                              <strong>Impact:</strong> {rec.impact}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Security Score */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Security Assessment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Security Score</span>
                        <span className={`text-2xl font-bold ${getHealthColor(page.security.overall_score)}`}>
                          {page.security.overall_score}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Authentication</span>
                          <span className={getHealthColor(page.security.authentication_score)}>
                            {page.security.authentication_score}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Authorization</span>
                          <span className={getHealthColor(page.security.authorization_score)}>
                            {page.security.authorization_score}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Data Protection</span>
                          <span className={getHealthColor(page.security.data_protection_score)}>
                            {page.security.data_protection_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Issues */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Security Issues</h4>
                    <div className="space-y-2">
                      {page.security.vulnerabilities && page.security.vulnerabilities.length > 0 ? (
                        page.security.vulnerabilities.map((vuln, index) => (
                          <div key={index} className={`p-3 border rounded-md ${getPriorityColor(vuln.severity)}`}>
                            <div className="flex items-start justify-between">
                              <h5 className="text-sm font-medium">{vuln.title}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(vuln.severity)}`}>
                                {vuln.severity}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{vuln.description}</p>
                            {vuln.recommendation && (
                              <p className="text-xs mt-2">
                                <strong>Recommendation:</strong> {vuln.recommendation}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-800">No security vulnerabilities detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accessibility Score */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Accessibility Assessment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Accessibility Score</span>
                        <span className={`text-2xl font-bold ${getHealthColor(page.accessibility.overall_score)}`}>
                          {page.accessibility.overall_score}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>WCAG 2.1 AA</span>
                          <span className={getHealthColor(page.accessibility.wcag_compliance)}>
                            {page.accessibility.wcag_compliance}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Screen Reader</span>
                          <span className={getHealthColor(page.accessibility.screen_reader_compatibility)}>
                            {page.accessibility.screen_reader_compatibility}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Keyboard Navigation</span>
                          <span className={getHealthColor(page.accessibility.keyboard_navigation)}>
                            {page.accessibility.keyboard_navigation}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Issues */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Accessibility Issues</h4>
                    <div className="space-y-2">
                      {page.accessibility.issues && page.accessibility.issues.length > 0 ? (
                        page.accessibility.issues.map((issue, index) => (
                          <div key={index} className={`p-3 border rounded-md ${getPriorityColor(issue.priority)}`}>
                            <div className="flex items-start justify-between">
                              <h5 className="text-sm font-medium">{issue.title}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                                {issue.priority}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{issue.description}</p>
                            {issue.wcag_criteria && (
                              <p className="text-xs mt-2">
                                <strong>WCAG Criteria:</strong> {issue.wcag_criteria}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-800">No accessibility issues detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forms Tab */}
            {activeTab === 'forms' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Forms Analysis</h4>
                  <div className="space-y-4">
                    {page.forms.map((form, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">Form {index + 1}: {form.name}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(form.complexity_level)}`}>
                            {form.complexity_level} complexity
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="text-xs font-medium text-gray-500 mb-2">Form Details</h6>
                            <div className="space-y-1 text-sm">
                              <p><strong>Fields:</strong> {form.fields.length}</p>
                              <p><strong>Type:</strong> {form.form_type}</p>
                              <p><strong>Validation:</strong> {form.validation_rules ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h6 className="text-xs font-medium text-gray-500 mb-2">Performance</h6>
                            <div className="space-y-1 text-sm">
                              <p><strong>Load Time:</strong> {form.performance?.load_time || 'N/A'}ms</p>
                              <p><strong>Submit Time:</strong> {form.performance?.submit_time || 'N/A'}ms</p>
                            </div>
                          </div>
                        </div>

                        {/* Form Fields */}
                        {form.fields.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-xs font-medium text-gray-500 mb-2">Fields</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {form.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className="text-xs p-2 bg-gray-50 rounded border">
                                  <p className="font-medium">{field.name}</p>
                                  <p className="text-gray-600">{field.field_type}</p>
                                  {field.required && (
                                    <span className="text-red-600 text-xs">Required</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Details Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Analysis Metadata */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Analysis Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis ID</span>
                        <span className="font-medium">{page.analysis_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Analyzed</span>
                        <span className="font-medium">
                          {new Date(page.last_analyzed).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Version</span>
                        <span className="font-medium">{page.analysis_version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence Level</span>
                        <span className="font-medium">
                          {(page.confidence_level * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Tags */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Analysis Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {page.analysis_tags && page.analysis_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Metrics (if enabled) */}
                {showAdvancedMetrics && page.advanced_analysis && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Analysis Metrics</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Machine Learning Score:</strong> {page.advanced_analysis.ml_score?.toFixed(2)}</p>
                          <p><strong>Anomaly Detection:</strong> {page.advanced_analysis.anomaly_detection ? 'Yes' : 'No'}</p>
                          <p><strong>Predictive Insights:</strong> {page.advanced_analysis.predictive_insights ? 'Available' : 'None'}</p>
                        </div>
                        <div>
                          <p><strong>Historical Trend:</strong> {page.advanced_analysis.historical_trend || 'N/A'}</p>
                          <p><strong>Risk Assessment:</strong> {page.advanced_analysis.risk_assessment || 'N/A'}</p>
                          <p><strong>Optimization Potential:</strong> {page.advanced_analysis.optimization_potential || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HCMPageDetail;