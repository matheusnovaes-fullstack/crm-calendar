import axios from "axios";

const api = axios.create({ baseURL: "https://crm-calendar-backend.onrender.com/api" });

export const getIssues = (projeto)  => api.get(`/issues/${projeto}`);
export const getAnexos = (issueKey) => api.get(`/issues/${issueKey}/attachments`);
