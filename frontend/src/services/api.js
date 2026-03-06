const API_BASE =
  import.meta.env.VITE_API_URL || "https://crm-calendar-backend.onrender.com/api/issues/CP";

export async function getIssues(projeto = "CP") {
  const response = await fetch(`${API_BASE}/issues/${projeto}`);
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

// === NOVO NOME ===
export async function getAttachments(key) {
  try {
    const response = await fetch(`${API_BASE}/issues/${key}/attachments`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return response.json();
  } catch {
    return [];
  }
}

// === NOVO NOME ===
export async function proxyAnexo(url) {
  return fetch(`${API_BASE}/issues/anexo-proxy?url=${encodeURIComponent(url)}`);
}

/* ===========================
   ALIAS PARA NÃO QUEBRAR FRONT
=========================== */

export const getAnexos = getAttachments;
export const anexoProxy = proxyAnexo;

export default {
  getIssues,
  getAttachments,
  proxyAnexo,
  getAnexos,
  anexoProxy,
};
