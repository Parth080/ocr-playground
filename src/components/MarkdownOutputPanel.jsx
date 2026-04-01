import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownOutputPanel({ content }) {
  const [view, setView] = useState('rendered')

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Markdown Output</h3>
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => setView('rendered')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              view === 'rendered' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Rendered
          </button>
          <button
            onClick={() => setView('raw')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              view === 'raw' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Raw
          </button>
        </div>
      </div>

      {view === 'rendered' ? (
        <div className="prose prose-invert prose-sm max-w-none overflow-auto max-h-[700px] bg-gray-950 rounded-lg p-6">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <pre className="text-xs text-gray-300 overflow-auto max-h-[700px] bg-gray-950 rounded-lg p-4 font-mono leading-relaxed whitespace-pre-wrap">
          {content}
        </pre>
      )}
    </div>
  )
}
