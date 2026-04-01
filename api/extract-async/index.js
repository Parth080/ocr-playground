export const config = { api: { bodyParser: false } };
import { proxyToModal } from '../_lib/proxy.js';

export default function handler(req, res) {
  return proxyToModal('/extract-async', req, res);
}
