import axios from "axios";

const BASE = "https://crm-calendar-backend.onrender.com/api";
const api  = axios.create({ baseURL: BASE });

export const getIssues  = (projeto)  => api.get(`/issues/${projeto}`);
export const getAnexos  = (issueKey) => api.get(`/issues/${issueKey}/attachments`);
export const anexoProxy = (url)      => `${BASE}/issues/anexo-proxy?url=${encodeURIComponent(url)}`;
