const API = '/api'

export async function getHealth() {
  const res = await fetch(`${API}/health`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getConfig() {
  const res = await fetch(`${API}/config`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function postExtractAsync(file, clientId, projectId) {
  const form = new FormData()
  form.append('file', file)
  form.append('client_id', clientId)
  form.append('project_id', projectId)

  const res = await fetch(`${API}/extract-async`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getExtractAsyncStatus(statusId) {
  const res = await fetch(`${API}/extract-async/${statusId}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function postExtractAsyncMarkdown(file, clientId, projectId) {
  const form = new FormData()
  form.append('file', file)
  form.append('client_id', clientId)
  form.append('project_id', projectId)

  const res = await fetch(`${API}/extract-async/markdown`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getExtractAsyncMarkdownStatus(statusId) {
  const res = await fetch(`${API}/extract-async/markdown/${statusId}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}
