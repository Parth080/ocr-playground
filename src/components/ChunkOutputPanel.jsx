import { useEffect, useRef } from 'react'

const TYPE_COLORS = {
  text: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  table: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  figure: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  attestation: 'bg-red-500/10 text-red-400 ring-red-500/20',
  scan_code: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  id_card: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
  marginalia: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
}

const DEFAULT_TYPE_COLOR = 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20'

export default function ChunkOutputPanel({ chunks, activeChunkIdx, onChunkClick, result }) {
  const listRef = useRef(null)
  const chunkRefs = useRef({})

  useEffect(() => {
    if (activeChunkIdx != null && chunkRefs.current[activeChunkIdx]) {
      chunkRefs.current[activeChunkIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeChunkIdx])

  const pages = groupByPage(chunks)
  const totalPages = result?.total_pages || Math.max(...chunks.map((c) => c.grounding?.page || c.page || 0))
  const processingTime = result?.processing_time_ms
    ? `${(result.processing_time_ms / 1000).toFixed(1)}s`
    : result?.processing_time
      ? `${result.processing_time.toFixed(1)}s`
      : null

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">
            Extraction Output
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{chunks.length} chunks</span>
            <span>{totalPages} pages</span>
            {processingTime && <span>{processingTime}</span>}
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-6">
        {pages.map(([pageNum, pageChunks]) => (
          <div key={pageNum}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Page {pageNum}
            </div>
            <div className="space-y-2">
              {pageChunks.map((chunk) => {
                const isActive = activeChunkIdx === chunk._globalIdx
                const typeColor = TYPE_COLORS[chunk.chunk_type] || DEFAULT_TYPE_COLOR

                return (
                  <div
                    key={chunk.chunk_id || chunk._globalIdx}
                    ref={(el) => (chunkRefs.current[chunk._globalIdx] = el)}
                    onClick={() => onChunkClick(chunk._globalIdx)}
                    className={`chunk-card rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-700 transition-all ${
                      isActive ? 'active border-indigo-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-gray-500">#{chunk.chunk_index}</span>
                      <span className={`badge ring-1 ${typeColor}`}>{chunk.chunk_type}</span>
                      {chunk.grounding?.confidence && (
                        <span className="text-[10px] text-gray-600">
                          conf: {(chunk.grounding.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className={`text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words ${isActive ? '' : 'max-h-40 overflow-hidden'}`}>
                      {chunk.markdown || <span className="text-gray-600 italic">No text extracted</span>}
                    </div>
                    {chunk.r2_url && (
                      <a
                        href={chunk.r2_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View image &rarr;
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function groupByPage(chunks) {
  const map = new Map()
  chunks.forEach((chunk, idx) => {
    const page = chunk.grounding?.page || chunk.page || 0
    if (!map.has(page)) map.set(page, [])
    map.get(page).push({ ...chunk, _globalIdx: idx })
  })
  return [...map.entries()].sort((a, b) => a[0] - b[0])
}
