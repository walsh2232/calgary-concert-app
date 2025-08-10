import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { hcmApi } from '../services/api';
import { HCMPage } from '../types/hcm';
import HCMPageDetail from './HCMPageDetail';

interface HCMPagesListProps {
  onPageSelect?: (page: HCMPage) => void;
  showAdvancedMetrics?: boolean;
}

const HCMPagesList: React.FC<HCMPagesListProps> = ({ onPageSelect, showAdvancedMetrics = false }) => {
  const [pages, setPages] = useState<HCMPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedPage, setSelectedPage] = useState<HCMPage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await hcmApi.getPages();
      if (response.data.success) {
        setPages(response.data.data);
      } else {
        setError('Failed to fetch pages');
      }
    } catch (err) {
      setError('Error fetching pages: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (page: HCMPage) => {
    setSelectedPage(page);
    setShowDetailModal(true);
    if (onPageSelect) {
      onPageSelect(page);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPage(null);
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.page_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || page.page_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const sortedPages = [...filteredPages].sort((a, b) => {
    let aValue: any = a[sortBy as keyof HCMPage];
    let bValue: any = b[sortBy as keyof HCMPage];
    
    if (sortBy === 'performance.optimization_score') {
      aValue = a.performance.optimization_score;
      bValue = b.performance.optimization_score;
    } else if (sortBy === 'last_analyzed') {
      aValue = new Date(a.last_analyzed).getTime();
      bValue = new Date(b.last_analyzed).getTime();
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
  };

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
              onClick={fetchPages}
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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search HCM pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
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
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing {sortedPages.length} of {pages.length} pages
        </p>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('title')}>
                  <div className="flex items-center space-x-1">
                    <span>Page Name</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('page_type')}>
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {getSortIcon('page_type')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('performance.optimization_score')}>
                  <div className="flex items-center space-x-1">
                    <span>Performance</span>
                    {getSortIcon('performance.optimization_score')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('complexity_level')}>
                  <div className="flex items-center space-x-1">
                    <span>Complexity</span>
                    {getSortIcon('complexity_level')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('last_analyzed')}>
                  <div className="flex items-center space-x-1">
                    <span>Last Analyzed</span>
                    {getSortIcon('last_analyzed')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handlePageClick(page)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">{page.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(page.page_type)}`}>
                      {page.page_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getHealthColor(page.performance.optimization_score)}`}>
                        {page.performance.optimization_score}%
                      </span>
                      {getHealthIcon(page.performance.optimization_score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(page.complexity_level)}`}>
                      {page.complexity_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.last_analyzed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageClick(page);
                      }}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {sortedPages.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No HCM pages are currently available.'
            }
          </p>
        </div>
      )}

      {/* Page Detail Modal */}
      <HCMPageDetail
        page={selectedPage}
        isOpen={showDetailModal}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default HCMPagesList;