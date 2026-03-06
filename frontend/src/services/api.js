import axios from "axios";

const BASE = "http://localhost:3001/api";

const api = axios.create({
  baseURL: BASE
});

export async function getIssues(projeto) {
  const res = await api.get(`/issues/${projeto}`);
  return res.data;
}

export async function getAnexos(key) {
  const res = await api.get(`/issues/${key}/attachments`);
  return res.data;
}

export const anexoProxy = url =>
  `${BASE}/issues/anexo-proxy?url=${encodeURIComponent(url)}`;
