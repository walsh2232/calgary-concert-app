import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oracle HCM Analysis Platform',
  description: 'Comprehensive analysis platform for Oracle HCM systems with PhD-level detail',
  keywords: ['Oracle', 'HCM', 'Human Capital Management', 'Analysis', 'Documentation', 'Best Practices'],
  authors: [{ name: 'Oracle HCM Analysis Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  )
}