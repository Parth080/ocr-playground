import { useState } from 'react'

export default function ResponsePanel({ data }) {
  const [collapsed, setCollapsed] = useState(false)
  const json = JSON.stringify(data, null, 2)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Response</h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(json)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Copy JSON
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <pre className="text-xs text-gray-300 overflow-auto max-h-[600px] bg-gray-950 rounded-lg p-4 font-mono leading-relaxed">
          {json}
        </pre>
      )}
    </div>
  )
}
