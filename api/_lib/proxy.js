/**
 * Collect the raw body from the incoming request into a Buffer.
 */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Proxy a request to the Modal backend.
 * @param {string} modalPath - Path on Modal (e.g. "/health")
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export async function proxyToModal(modalPath, req, res) {
  const modalUrl = process.env.VITE_MODAL_URL;
  const modalKey = process.env.MODAL_KEY;
  const modalSecret = process.env.MODAL_SECRET;

  if (!modalUrl) {
    return res.status(500).json({ error: 'VITE_MODAL_URL is not configured' });
  }

  const targetUrl = `${modalUrl}${modalPath}`;
  console.log(`[proxy] ${req.method} ${modalPath} → ${targetUrl}`);

  const headers = {};
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
  if (req.headers['accept']) headers['accept'] = req.headers['accept'];
  if (modalKey) headers['Modal-Key'] = modalKey;
  if (modalSecret) headers['Modal-Secret'] = modalSecret;

  const fetchOpts = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOpts.body = await getRawBody(req);
  }

  try {
    const upstream = await fetch(targetUrl, fetchOpts);
    const ct = upstream.headers.get('content-type') || '';

    res.status(upstream.status);
    if (ct) res.setHeader('content-type', ct);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error('[proxy] error:', err);
    res.status(502).json({ error: err.message });
  }
}
