const axios = require("axios");
require("dotenv").config();

const auth = {
  username: process.env.JIRA_EMAIL,
  password: process.env.JIRA_TOKEN
};

const baseURL = `https://${process.env.JIRA_DOMAIN}`;
const WORKSPACE = "cec02f52-6697-4bef-9a4a-c83db0c65e6a";

async function buscarNomeAsset(objectId) {
  try {
    const { data } = await axios.get(
      `${baseURL}/gateway/api/jsm/assets/workspace/${WORKSPACE}/v1/object/${objectId}`,
      { auth }
    );
    return data?.label || null;
  } catch {
    return null;
  }
}

async function resolverCMDB(field) {
  if (!Array.isArray(field)) return null;

  const nomes = await Promise.all(
    field.map(o => buscarNomeAsset(o.objectId))
  );

  return nomes.filter(Boolean).join(", ") || null;
}

function extrairTextoRich(doc) {
  if (!doc?.content) return null;

  function walk(nodes) {
    return nodes
      .map(n => {
        if (n.type === "text") return n.text;
        if (n.content) return walk(n.content);
        return "";
      })
      .join("");
  }

  return walk(doc.content).trim();
}

function extrairValor(campo) {
  if (!campo) return null;

  if (campo.type === "doc") {
    return extrairTextoRich(campo);
  }

  if (typeof campo === "string") return campo;

  if (Array.isArray(campo)) {
    return campo
      .map(i => i.value || i.name || i.displayName || null)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof campo === "object") {
    return (
      campo.value ||
      campo.name ||
      campo.displayName ||
      campo.label ||
      null
    );
  }

  return campo;
}

async function buscarIssues(projeto) {

  const { data } = await axios.get(`${baseURL}/rest/api/3/search/jql`, {
    auth,
    params: {
      jql: `project=${projeto} ORDER BY created DESC`,
      maxResults: 100,
      fields: [
        "summary",
        "status",
        "assignee",
        "reporter",
        "created",
        "priority",
        "components",
        "customfield_10010",
        "customfield_12590",
        "customfield_14439",
        "customfield_14440",
        "customfield_12689",
        "customfield_14438",
        "customfield_11727",
        "customfield_14441",
        "customfield_17930",
        "customfield_17036",
        "customfield_14447",
        "customfield_14443",
        "customfield_14585",
        "customfield_14452",
        "customfield_12854",
        "customfield_11730",
        "customfield_14810",
        "customfield_10556",
        "customfield_15094",
        "customfield_12755",

        // 🔥 NOVOS CAMPOS
        "customfield_14442",
        "customfield_14444",
        "customfield_14586"
      ].join(",")
    }
  });

  const issues = await Promise.all(
    data.issues.map(async issue => {

      const f = issue.fields;

      const casa_cmdb = await resolverCMDB(f.customfield_12755);

      return {

        chave: issue.key,
        resumo: f.summary,

        request_type: f.customfield_10010?.requestType?.name || null,
        catalogo: f.customfield_12590?.value || null,
        componente: f.components?.[0]?.name || null,

        status: f.status?.name,
        prioridade: f.priority?.name || null,

        relator: f.reporter?.displayName || null,
        responsavel: f.assignee?.displayName || null,

        criado: f.created,
        datainicio: f.customfield_14439,
        dataresolucao: f.customfield_14440,

        nome_promocao: f.customfield_14438,

        jogo: extrairValor(f.customfield_11727),

        // ✅ SEGMENTO CORRIGIDO
        segmento: extrairValor(f.customfield_14441),

        tipoPremio: extrairValor(f.customfield_17930),

        // 🔥 NOVOS
        canalEnvio: extrairValor(f.customfield_14442),
        criterioEleg: extrairValor(f.customfield_14444),
        linkCampanha: extrairValor(f.customfield_14586),

        id_cliente_vip: f.customfield_17036,

        descricao_benef: extrairTextoRich(f.customfield_14443),

        aplicacao: extrairValor(f.customfield_14452),

        valor_ingresso: f.customfield_12854,

        area: f.customfield_11730,

        relator_orig: f.customfield_14810?.displayName,

        envolvidos: Array.isArray(f.customfield_10556)
          ? f.customfield_10556.map(e => e.displayName).join(", ")
          : null,

        casa: casa_cmdb
      };

    })
  );

  return issues;
}

module.exports = { buscarIssues };
