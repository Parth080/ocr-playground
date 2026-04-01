import { useState, useRef, useCallback } from 'react'
import { postExtractAsyncMarkdown, getExtractAsyncMarkdownStatus } from '../lib/api'
import PollingStatus from '../components/PollingStatus'
import MarkdownOutputPanel from '../components/MarkdownOutputPanel'
import ResponsePanel from '../components/ResponsePanel'

export default function ExtractAsyncMarkdownPage() {
  const [file, setFile] = useState(null)
  const [clientId, setClientId] = useState('aaaaaaaaaaaaaaaaaaaaaaaa')
  const [projectId, setProjectId] = useState('bbbbbbbbbbbbbbbbbbbbbbbb')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recordId, setRecordId] = useState(null)
  const [polling, setPolling] = useState(false)
  const [result, setResult] = useState(null)
  const [pollCount, setPollCount] = useState(0)
  const intervalRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    setRecordId(null)
    setPolling(false)
    setPollCount(0)

    try {
      const res = await postExtractAsyncMarkdown(file, clientId, projectId)
      setRecordId(res.record_id)
      setPolling(true)
      startPolling(res.record_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startPolling = useCallback((rid) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    const poll = async () => {
      try {
        setPollCount((c) => c + 1)
        const status = await getExtractAsyncMarkdownStatus(rid)
        if (status.processing_status === 'completed' || status.processing_status === 'failed') {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setPolling(false)
          setResult(status)
        }
      } catch {
        // keep polling
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 30000)
  }, [])

  function handleStopPolling() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setPolling(false)
  }

  const markdownContent = extractMarkdownContent(result)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-post">POST</span>
          <code className="text-sm text-gray-400 font-mono">/extract-async/markdown</code>
        </div>
        <h1 className="text-2xl font-bold text-white">Extract Async (Markdown)</h1>
        <p className="text-gray-400 mt-1">
          Upload a PDF for async extraction as a Nanonets-compatible markdown document.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">PDF File *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1
                file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Client ID (24 chars) *</label>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} maxLength={24} className="input-field font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project ID (24 chars) *</label>
            <input value={projectId} onChange={(e) => setProjectId(e.target.value)} maxLength={24} className="input-field font-mono" />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" disabled={loading || !file} className="btn-primary">
            {loading ? 'Submitting...' : 'Upload & Extract'}
          </button>
        </div>
      </form>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {recordId && polling && (
        <PollingStatus recordId={recordId} pollCount={pollCount} onStop={handleStopPolling} />
      )}

      {result && result.processing_status === 'failed' && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-red-400 text-sm font-medium">Extraction failed</p>
          <p className="text-red-400/80 text-sm mt-1">{result.error || 'Unknown error'}</p>
        </div>
      )}

      {markdownContent && <MarkdownOutputPanel content={markdownContent} />}

      {result && !markdownContent && result.processing_status === 'completed' && (
        <ResponsePanel data={result} />
      )}
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
