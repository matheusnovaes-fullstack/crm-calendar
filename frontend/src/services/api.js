// ✅ API_BASE aponta para a RAIZ da api, sem /issues/CP
const API_BASE =
  import.meta.env.VITE_API_URL || "https://crm-calendar-backend.onrender.com/api";

export async function getIssues(projeto = "CP") {
  const response = await fetch(`${API_BASE}/${projeto}`);
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

export async function getAttachments(key) {
  try {
    const response = await fetch(`${API_BASE}/${key}/attachments`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return response.json();
  } catch {
    return [];
  }
}

export async function proxyAnexo(url) {
  return fetch(`${API_BASE}/anexo-proxy?url=${encodeURIComponent(url)}`);
}

export const getAnexos  = getAttachments;
export const anexoProxy = proxyAnexo;

export default { getIssues, getAttachments, proxyAnexo, getAnexos, anexoProxy };
