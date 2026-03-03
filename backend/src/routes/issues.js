const express          = require("express");
const axios            = require("axios");
const { buscarIssues } = require("../services/jiraService");
const router           = express.Router();

let cache = {};

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

router.get("/:key/attachments", async (req, res) => {
  const { key } = req.params;
  try {
    const { data } = await axios.get(
      `https://${process.env.JIRA_DOMAIN}/rest/api/3/issue/${key}`,
      {
        auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_TOKEN },
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
