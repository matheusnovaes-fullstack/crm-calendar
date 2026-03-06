const axios = require("axios");
require("dotenv").config();

const auth      = { username: process.env.JIRA_EMAIL, password: process.env.JIRA_TOKEN };
const baseURL   = `https://${process.env.JIRA_DOMAIN}`;
const WORKSPACE = "cec02f52-6697-4bef-9a4a-c83db0c65e6a";

async function buscarNomeAsset(objectId) {
  try {
    const { data } = await axios.get(
      `${baseURL}/gateway/api/jsm/assets/workspace/${WORKSPACE}/v1/object/${objectId}`,
      { auth, headers: { Accept: "application/json" } }
    );
    return data?.label || null;
  } catch {
    return null;
  }
}

async function resolverCMDB(field) {
  if (!Array.isArray(field) || field.length === 0) return null;
  const nomes = await Promise.all(field.map(o => buscarNomeAsset(o.objectId)));
  return nomes.filter(Boolean).join(", ") || null;
}

const extrairTexto = (doc) => {
  if (!doc?.content) return null;
  return doc.content
    .flatMap(b => b.content || [])
    .map(n => n.text || "")
    .join("")
    .trim() || null;
};

const extrairValor = (campo) => {
  if (!campo) return null;
  if (typeof campo === "string") return campo.trim();
  if (Array.isArray(campo)) {
    return campo
      .map(v => {
        if (typeof v === "string") return v;
        return v.value || v.name || v.label || null;
      })
      .filter(Boolean)
      .join(", ") || null;
  }
  return campo.value || campo.name || campo.label || null;
};

async function buscarIssues(projeto) {
  console.log(`Buscando issues do projeto ${projeto}...`);
  try {
    const { data } = await axios.get(`${baseURL}/rest/api/3/search/jql`, {
      auth,
      headers: { Accept: "application/json" },
      timeout: 20000,
      params: {
        jql: `project=${projeto} ORDER BY created DESC`,
        fields: [
          "summary", "status", "assignee", "reporter",
          "created", "priority", "components",
          "customfield_10010", "customfield_12590",
          "customfield_14439", "customfield_14440",
          "customfield_12689",
          "customfield_14438",
          "customfield_11727",
          "customfield_17929",
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
          "customfield_10194",
          "customfield_14703",
          "customfield_15094",
          "customfield_12755",
        ].join(","),
        maxResults: 100,
        startAt: 0,
      },
    });

    console.log(`${data.issues.length} issues encontradas`);

    const issues = await Promise.all((data.issues || []).map(async (issue) => {
      const f     = issue.fields;
      const sla   = f.customfield_12689 || {};
      const ciclo = sla.ongoingCycle || (sla.completedCycles || [{}]).at(-1) || {};

      const [casa_cmdb, casa2_cmdb] = await Promise.all([
        resolverCMDB(f.customfield_12755),
        resolverCMDB(f.customfield_15094),
      ]);

      const casa_legado = Array.isArray(f.customfield_12755)
        ? f.customfield_12755.map(c => c.value || c.name).filter(Boolean).join(", ")
        : f.customfield_12755?.value || f.customfield_12755?.name || null;

      const casa = casa_cmdb || casa_legado || casa2_cmdb || null;

      return {
        chave:            issue.key,
        resumo:           f.summary,
        request_type:     f.customfield_10010?.requestType?.name || null,
        catalogo:         f.customfield_12590?.value || null,
        componente:       f.components?.[0]?.name || null,
        status:           f.status?.name,
        prioridade:       f.priority?.name || null,
        relator:          f.reporter?.displayName || null,
        responsavel:      f.assignee?.displayName || null,
        responsavel_camp: f.customfield_14447?.displayName || null,
        criado:           f.created,
        data_inicio:      f.customfield_14439,
        data_resolucao:   f.customfield_14440,
        sla_tempo:        ciclo.elapsedTime?.friendly || null,
        sla_breached:     ciclo.breached || false,
        sla_restante:     ciclo.remainingTime?.friendly || null,
        nome_promocao:    f.customfield_14438 || null,
        jogo:             f.customfield_11727?.value || f.customfield_11727 || null,
        segmento:         extrairValor(f.customfield_17929),
        tipoPremio:       extrairValor(f.customfield_17930),
        id_cliente_vip:   f.customfield_17036 || null,
        descricao_benef:  extrairTexto(f.customfield_14443),
        pontos_criticos:  extrairTexto(f.customfield_14585),
        aplicacao:        f.customfield_14452?.value || null,
        envolvidos:       Array.isArray(f.customfield_10556)
                            ? f.customfield_10556.map(e => e.displayName).join(", ")
                            : null,
        valor_ingresso:   f.customfield_12854 || null,
        area:             f.customfield_11730 || null,
        relator_orig:     f.customfield_14810?.displayName || null,
        casa,
        casa2:            casa2_cmdb || null,
        casa_debug:       { casa_cmdb, casa_legado, casa2_cmdb },
      };
    }));

    return issues;

  } catch (err) {
    console.error("Erro:", err.message);
    throw err;
  }
}

module.exports = { buscarIssues };
