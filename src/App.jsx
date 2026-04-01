import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import HealthPage from './pages/HealthPage'
import ConfigPage from './pages/ConfigPage'
import ExtractAsyncPage from './pages/ExtractAsyncPage'
import ExtractAsyncStatusPage from './pages/ExtractAsyncStatusPage'
import ExtractAsyncMarkdownPage from './pages/ExtractAsyncMarkdownPage'
import ExtractAsyncMarkdownStatusPage from './pages/ExtractAsyncMarkdownStatusPage'

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              FlamAI OCR Playground
            </span>
          </Link>
          {!isLanding && (
            <Link to="/" className="btn-secondary text-xs">
              All Endpoints
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/extract-async" element={<ExtractAsyncPage />} />
          <Route path="/extract-async/status" element={<ExtractAsyncStatusPage />} />
          <Route path="/extract-async/markdown" element={<ExtractAsyncMarkdownPage />} />
          <Route path="/extract-async/markdown/status" element={<ExtractAsyncMarkdownStatusPage />} />
        </Routes>
      </main>
    </div>
  )
}
