import { useState } from 'react'
import { getConfig } from '../lib/api'
import ResponsePanel from '../components/ResponsePanel'

export default function ConfigPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRun() {
    setLoading(true)
    setError(null)
    try {
      const res = await getConfig()
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-get">GET</span>
          <code className="text-sm text-gray-400 font-mono">/config</code>
        </div>
        <h1 className="text-2xl font-bold text-white">Configuration</h1>
        <p className="text-gray-400 mt-1">View current pipeline configuration.</p>
      </div>

      <button onClick={handleRun} disabled={loading} className="btn-primary mb-6">
        {loading ? 'Loading...' : 'Send Request'}
      </button>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {data && <ResponsePanel data={data} />}
    </div>
  )
}
