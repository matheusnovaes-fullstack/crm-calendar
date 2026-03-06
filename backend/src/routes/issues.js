const express          = require("express");
const axios            = require("axios");
const { buscarIssues } = require("../services/jiraService");
const router           = express.Router();

const auth = {
  username: process.env.JIRA_EMAIL,
  password: process.env.JIRA_TOKEN
};

let cache = {};

// === NOVAS FUNÇÕES PARA RICHTEXT ===
function extrairTextoRich(doc) {
  function walk(node) {
    if (node.type === 'text') return node.text || '';
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(walk).join('');
    }
    return '';
  }
  return walk(doc) || null;
}

function extrairValor(issue, campoId) {
  const campo = issue.fields[`customfield_${campoId}`];
  
  if (!campo) return null;
  
  // Trata rich text (Jira rich editor)
  if (campo.type === 'doc' && campo.content) {
    return extrairTextoRich(campo);
  }
  
  // Campo simples (string/select)
  return campo.value || campo || null;
}

// Proxy de anexos autenticados
router.get("/anexo-proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL não informada" });

  try {
    const response = await axios.get(url, {
      auth,
      responseType: "stream",
      headers: { Accept: "*/*" },
    });
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", response.headers["content-disposition"] || "attachment");
    response.data.pipe(res);
  } catch (err) {
    res.status(403).json({ error: "Sem permissão para acessar o anexo." });
  }
});

// Busca issues por projeto
router.get("/:projeto", async (req, res) => {
  const { projeto } = req.params;
  if (projeto === "attachments") return;

  const agora = Date.now();
  if (cache[projeto] && agora - cache[projeto].timestamp < 5 * 60 * 1000) {
    return res.json({ source: "cache", data: cache[projeto].data });
  }

  try {
    const data     = await buscarIssues(projeto);
    cache[projeto] = { data, timestamp: agora };
    res.json({ source: "jira", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Busca anexos de um ticket
router.get("/:key/attachments", async (req, res) => {
  const { key } = req.params;
  try {
    const { data } = await axios.get(
      `https://${process.env.JIRA_DOMAIN}/rest/api/3/issue/${key}`,
      {
        auth,
        headers: { Accept: "application/json" },
        params: { fields: "attachment" }
      }
    );
    const anexos = data.fields?.attachment || [];
    res.json(anexos.map(a => ({
      id:       a.id,
      filename: a.filename,
      mimeType: a.mimeType,
      size:     a.size,
      content:  a.content,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
