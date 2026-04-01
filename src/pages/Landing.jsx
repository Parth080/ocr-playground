import { Link } from 'react-router-dom'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/health',
    title: 'Health Check',
    description: 'Check if the pipeline service is up and running.',
    link: '/health',
  },
  {
    method: 'GET',
    path: '/config',
    title: 'Configuration',
    description: 'View current pipeline configuration including YOLO, DPI, lane models, and throttle settings.',
    link: '/config',
  },
  {
    method: 'POST',
    path: '/extract-async',
    title: 'Extract Async (Chunks + BBox)',
    description: 'Upload a PDF or resume with a record ID. Returns structured chunks with bounding boxes, spatial grounding, and reading order. Includes a PDF viewer with bbox overlays.',
    link: '/extract-async',
    highlight: true,
  },
  {
    method: 'POST',
    path: '/extract-async/markdown',
    title: 'Extract Async (Markdown)',
    description: 'Upload a PDF or resume with a record ID. Returns a single combined Nanonets-compatible markdown document with rendered preview.',
    link: '/extract-async/markdown',
  },
]

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">
          FlamAI OCR API
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Document intelligence pipeline powered by YOLO layout detection and multi-lane VLM extraction.
          Upload PDFs and get structured chunks with bounding boxes or clean markdown.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ENDPOINTS.map((ep) => (
          <Link
            key={ep.path}
            to={ep.link}
            className={`card-hover group flex flex-col ${ep.highlight ? 'ring-1 ring-indigo-500/30' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={ep.method === 'GET' ? 'badge-get' : 'badge-post'}>
                {ep.method}
              </span>
              <code className="text-xs text-gray-400 font-mono truncate">{ep.path}</code>
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">
              {ep.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-1">
              {ep.description}
            </p>
            <div className="mt-4 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Try it &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
