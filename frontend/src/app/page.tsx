'use client'

import { useState, useEffect } from 'react'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { AnalysisStatus } from '@/components/dashboard/AnalysisStatus'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SystemOverview } from '@/components/dashboard/SystemOverview'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const { analysisStatus, isLoading: statusLoading } = useAnalysisStatus()

  useEffect(() => {
    // Simulate loading time for initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || analyticsLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Oracle HCM Analysis Platform
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Comprehensive analysis and documentation platform for Oracle HCM systems
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats analytics={analytics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Status and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <AnalysisStatus status={analysisStatus} />
          <QuickActions />
        </div>

        {/* Right Column - System Overview */}
        <div className="space-y-6">
          <SystemOverview />
        </div>
      </div>

      {/* Recent Analyses */}
      <RecentAnalyses />

      {/* Feature Highlights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Deep Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">PhD-level detail on every HCM feature</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Best Practices</h3>
            <p className="text-sm text-gray-600 mt-1">Expert guidance and recommendations</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-purple-50">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Documentation</h3>
            <p className="text-sm text-gray-600 mt-1">Comprehensive guides and references</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-orange-50">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Smart Search</h3>
            <p className="text-sm text-gray-600 mt-1">Advanced filtering and discovery</p>
          </div>
        </div>
      </div>
    </div>
  )
}