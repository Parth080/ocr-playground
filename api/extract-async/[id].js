export const config = { api: { bodyParser: false } };
import { proxyToModal } from '../_lib/proxy.js';

export default function handler(req, res) {
  const { id } = req.query;
  return proxyToModal(`/extract-async/${id}`, req, res);
}
