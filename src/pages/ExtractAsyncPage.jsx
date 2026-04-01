import { useState, useRef, useCallback } from 'react'
import { postExtractAsync, getExtractAsyncStatus } from '../lib/api'
import PollingStatus from '../components/PollingStatus'
import PdfBboxViewer from '../components/PdfBboxViewer'
import ChunkOutputPanel from '../components/ChunkOutputPanel'

export default function ExtractAsyncPage() {
  const [file, setFile] = useState(null)
  const [clientId, setClientId] = useState('aaaaaaaaaaaaaaaaaaaaaaaa')
  const [projectId, setProjectId] = useState('bbbbbbbbbbbbbbbbbbbbbbbb')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recordId, setRecordId] = useState(null)
  const [polling, setPolling] = useState(false)
  const [result, setResult] = useState(null)
  const [pollCount, setPollCount] = useState(0)
  const [activeChunkIdx, setActiveChunkIdx] = useState(null)
  const [submittedFile, setSubmittedFile] = useState(null)
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
    setActiveChunkIdx(null)
    setSubmittedFile(file)

    try {
      const res = await postExtractAsync(file, clientId, projectId)
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
    intervalRef.current = setInterval(async () => {
      try {
        setPollCount((c) => c + 1)
        const status = await getExtractAsyncStatus(rid)
        if (status.processing_status === 'completed' || status.processing_status === 'failed') {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setPolling(false)
          setResult(status)
        }
      } catch {
        // keep polling
      }
    }, 30000)

    ;(async () => {
      try {
        setPollCount((c) => c + 1)
        const status = await getExtractAsyncStatus(rid)
        if (status.processing_status === 'completed' || status.processing_status === 'failed') {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setPolling(false)
          setResult(status)
        }
      } catch {
        // keep polling
      }
    })()
  }, [])

  function handleStopPolling() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setPolling(false)
  }

  const chunks = result?.chunks || []

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-post">POST</span>
          <code className="text-sm text-gray-400 font-mono">/extract-async</code>
        </div>
        <h1 className="text-2xl font-bold text-white">Extract Async (Chunks + BBox)</h1>
        <p className="text-gray-400 mt-1">
          Upload a PDF for structured OCR with bounding boxes. Results include chunk types, spatial grounding, and reading order.
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
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              maxLength={24}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project ID (24 chars) *</label>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              maxLength={24}
              className="input-field font-mono"
            />
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

      {result && chunks.length > 0 && (
        <div className="flex gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="w-1/2 overflow-auto rounded-xl border border-gray-800 bg-gray-900">
            <PdfBboxViewer
              pdfFile={submittedFile}
              chunks={chunks}
              activeChunkIdx={activeChunkIdx}
              onChunkClick={setActiveChunkIdx}
            />
          </div>
          <div className="w-1/2 overflow-auto rounded-xl border border-gray-800 bg-gray-900">
            <ChunkOutputPanel
              chunks={chunks}
              activeChunkIdx={activeChunkIdx}
              onChunkClick={setActiveChunkIdx}
              result={result}
            />
          </div>
        </div>
      )}
    </div>
  )
}
