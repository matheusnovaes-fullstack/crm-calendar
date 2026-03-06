const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getIssues(projeto = "CP") {
  const response = await fetch(`${API_BASE}/issues/${projeto}`);
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

export async function getAttachments(key) {
  try {
    const response = await fetch(`${API_BASE}/issues/${key}/attachments`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return response.json();
  } catch {
    return [];
  }
}

export async function proxyAnexo(url) {
  return fetch(`${API_BASE}/issues/anexo-proxy?url=${encodeURIComponent(url)}`);
}

export default { getIssues, getAttachments, proxyAnexo };
