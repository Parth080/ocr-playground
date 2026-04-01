export default function PollingStatus({ recordId, pollCount, onStop }) {
  return (
    <div className="card border-amber-500/30 bg-amber-500/5 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        <div>
          <p className="text-sm text-amber-300 font-medium">Processing...</p>
          <p className="text-xs text-amber-300/60 font-mono mt-0.5">
            record_id: {recordId} &middot; polls: {pollCount} &middot; interval: 30s
          </p>
        </div>
      </div>
      <button onClick={onStop} className="btn-secondary text-xs">
        Stop Polling
      </button>
    </div>
  )
}
