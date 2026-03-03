import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api" });

export const getIssues = (projeto)  => api.get(`/issues/${projeto}`);
export const getAnexos = (issueKey) => api.get(`/issues/${issueKey}/attachments`);
