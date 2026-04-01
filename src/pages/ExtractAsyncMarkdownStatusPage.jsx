import { useState, useRef, useCallback } from 'react'
import { getExtractAsyncMarkdownStatus } from '../lib/api'
import PollingStatus from '../components/PollingStatus'
import MarkdownOutputPanel from '../components/MarkdownOutputPanel'
import ResponsePanel from '../components/ResponsePanel'

export default function ExtractAsyncMarkdownStatusPage() {
  const [statusId, setStatusId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [polling, setPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const intervalRef = useRef(null)

  async function handleFetch() {
    if (!statusId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getExtractAsyncMarkdownStatus(statusId)
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startPolling = useCallback(() => {
    if (!statusId) return
    setPolling(true)
    setPollCount(0)
    setError(null)

    if (intervalRef.current) clearInterval(intervalRef.current)

    const poll = async () => {
      try {
        setPollCount((c) => c + 1)
        const status = await getExtractAsyncMarkdownStatus(statusId)
        setData(status)
        if (status.processing_status === 'completed' || status.processing_status === 'failed') {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setPolling(false)
        }
      } catch {
        // keep going
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 30000)
  }, [statusId])

  function handleStopPolling() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setPolling(false)
  }

  const markdownContent = extractMarkdownContent(data)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-get">GET</span>
          <code className="text-sm text-gray-400 font-mono">/extract-async/markdown/&#123;status_id&#125;</code>
        </div>
        <h1 className="text-2xl font-bold text-white">Poll Markdown Status</h1>
        <p className="text-gray-400 mt-1">Check the processing status of a markdown extraction job.</p>
      </div>

      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Record / Status ID *</label>
        <input
          value={statusId}
          onChange={(e) => setStatusId(e.target.value)}
          placeholder="Enter the record_id from extract-async/markdown"
          className="input-field font-mono mb-4"
        />
        <div className="flex gap-3">
          <button onClick={handleFetch} disabled={loading || !statusId} className="btn-primary">
            {loading ? 'Fetching...' : 'Fetch Once'}
          </button>
          <button
            onClick={polling ? handleStopPolling : startPolling}
            disabled={!statusId}
            className="btn-secondary"
          >
            {polling ? 'Stop Polling' : 'Start Polling (30s)'}
          </button>
        </div>
      </div>

      {polling && <PollingStatus recordId={statusId} pollCount={pollCount} onStop={handleStopPolling} />}

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {markdownContent && <MarkdownOutputPanel content={markdownContent} />}

      {data && !markdownContent && <ResponsePanel data={data} />}
    </div>
  )
}

function extractMarkdownContent(result) {
  if (!result) return null
  try {
    const content = result.content
    if (!content) return null
    const parsed = typeof content === 'string' ? JSON.parse(content) : content
    return parsed?.formats?.markdown?.content || null
  } catch {
    if (typeof result.content === 'string' && result.content.length > 0) {
      return result.content
    }
    return null
  }
}
