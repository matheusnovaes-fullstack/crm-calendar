const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const issuesRouter = require("./routes/issues");
const app          = express();

app.use(cors());
app.use(express.json());
app.use("/api/issues", issuesRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend rodando em http://localhost:${PORT}`));
