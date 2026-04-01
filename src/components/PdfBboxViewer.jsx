import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const CHUNK_COLORS = {
  text: { border: 'rgba(59, 130, 246, 0.7)', bg: 'rgba(59, 130, 246, 0.08)', label: '#3b82f6' },
  table: { border: 'rgba(16, 185, 129, 0.7)', bg: 'rgba(16, 185, 129, 0.08)', label: '#10b981' },
  figure: { border: 'rgba(245, 158, 11, 0.7)', bg: 'rgba(245, 158, 11, 0.08)', label: '#f59e0b' },
  attestation: { border: 'rgba(239, 68, 68, 0.7)', bg: 'rgba(239, 68, 68, 0.08)', label: '#ef4444' },
  scan_code: { border: 'rgba(168, 85, 247, 0.7)', bg: 'rgba(168, 85, 247, 0.08)', label: '#a855f7' },
  id_card: { border: 'rgba(236, 72, 153, 0.7)', bg: 'rgba(236, 72, 153, 0.08)', label: '#ec4899' },
  marginalia: { border: 'rgba(107, 114, 128, 0.7)', bg: 'rgba(107, 114, 128, 0.08)', label: '#6b7280' },
}
const DEFAULT_COLOR = { border: 'rgba(99, 102, 241, 0.7)', bg: 'rgba(99, 102, 241, 0.08)', label: '#6366f1' }

export default function PdfBboxViewer({ pdfFile, chunks, activeChunkIdx, onChunkClick }) {
  const [pdfData, setPdfData] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageReady, setPageReady] = useState(false)
  const [pageDims, setPageDims] = useState(null)
  const containerRef = useRef(null)
  const containerWidth = useContainerWidth(containerRef)

  useEffect(() => {
    if (!pdfFile) return
    const reader = new FileReader()
    reader.onload = () => setPdfData({ data: new Uint8Array(reader.result) })
    reader.readAsArrayBuffer(pdfFile)
  }, [pdfFile])

  function onDocumentLoadSuccess({ numPages: n }) {
    setNumPages(n)
    setCurrentPage(1)
  }

  function handlePageChange(page) {
    setPageReady(false)
    setPageDims(null)
    setCurrentPage(page)
  }

  function onPageRenderSuccess() {
    setPageReady(true)
  }

  function onPageLoadSuccess(page) {
    setPageDims({ width: page.originalWidth, height: page.originalHeight })
  }

  useEffect(() => {
    if (activeChunkIdx != null) {
      const chunk = chunks[activeChunkIdx]
      if (chunk) {
        const page = chunk.grounding?.page || chunk.page
        if (page && page !== currentPage) {
          handlePageChange(page)
        }
      }
    }
  }, [activeChunkIdx, chunks])

  const displayWidth = containerWidth > 0 ? containerWidth - 32 : 0
  const pageChunks = chunks
    .map((chunk, idx) => ({ ...chunk, _globalIdx: idx }))
    .filter((c) => c.grounding?.page === currentPage || c.page === currentPage)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <h3 className="text-sm font-medium text-gray-300">PDF Viewer</h3>
        {numPages && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="btn-secondary text-xs px-2 py-1"
            >
              Prev
            </button>
            <span className="text-xs text-gray-400 font-mono min-w-[60px] text-center">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="btn-secondary text-xs px-2 py-1"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {pdfData && displayWidth > 0 && (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<LoadingSpinner />}
            error={<PdfError />}
          >
            <div className="relative inline-block">
              <Page
                key={currentPage}
                pageNumber={currentPage}
                width={displayWidth}
                onLoadSuccess={onPageLoadSuccess}
                onRenderSuccess={onPageRenderSuccess}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<LoadingSpinner />}
              />
              {pageReady && pageDims && displayWidth > 0 &&
                pageChunks.map((chunk) => {
                  const g = chunk.grounding
                  if (!g?.bbox_relative) return null
                  const { left, top, right, bottom } = g.bbox_relative
                  const scale = displayWidth / pageDims.width

                  const x = left * displayWidth
                  const y = top * pageDims.height * scale
                  const w = (right - left) * displayWidth
                  const h = (bottom - top) * pageDims.height * scale

                  const isActive = activeChunkIdx === chunk._globalIdx
                  const colors = CHUNK_COLORS[chunk.chunk_type] || DEFAULT_COLOR

                  return (
                    <div
                      key={chunk.chunk_id || chunk._globalIdx}
                      onClick={() => onChunkClick(chunk._globalIdx)}
                      className="bbox-overlay"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${w}px`,
                        height: `${h}px`,
                        borderColor: isActive ? colors.label : colors.border,
                        backgroundColor: isActive ? colors.bg.replace('0.08', '0.2') : colors.bg,
                        borderWidth: isActive ? '3px' : '2px',
                        zIndex: isActive ? 20 : 10,
                      }}
                    >
                      <span
                        className="bbox-label"
                        style={{
                          backgroundColor: colors.label,
                          opacity: isActive ? 1 : undefined,
                        }}
                      >
                        #{chunk.chunk_index} {chunk.chunk_type}
                      </span>
                    </div>
                  )
                })}
            </div>
          </Document>
        )}
      </div>
    </div>
  )
}

function useContainerWidth(ref) {
  const [width, setWidth] = useState(0)
  const observer = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    observer.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.current.observe(ref.current)
    return () => observer.current?.disconnect()
  }, [ref])

  return width
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PdfError() {
  return (
    <div className="flex items-center justify-center py-20 text-red-400 text-sm">
      Failed to load PDF. Make sure the file is a valid PDF.
    </div>
  )
}
