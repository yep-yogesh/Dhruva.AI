// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { initializeLLM, getLLMResources } from "./initialiseLLM.js";
import { askRoute } from "./routes/askDhruva.js";

const app = express();
app.use(express.json());

import cors from "cors";
const FRONTEND = process.env.FRONTEND || "http://localhost:5173";
app.use(cors({
  origin: FRONTEND,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true, // enable if you need cookies/auth and use fetch(..., { credentials: 'include' })
}));
app.use(express.json());

app.get("/ping", (req, res) => res.json({ status: "ok" }));

console.log("Loaded OPENROUTER_KEY?", process.env.OPENROUTER_KEY ? "✅" : "❌");

let resources = null;

initializeLLM()
  .then(() => {
    resources = getLLMResources();

    // mount handler
    app.post("/ask", askRoute(resources));

    // admin endpoints
    app.get("/admin/status", (req, res) => {
      try {
        const { docs } = resources;
        return res.json({
          ready: true,
          chunks: docs.length,
          embed_store: process.env.EMBED_STORE_PATH || "./embed_store.json",
          pdf_path: process.env.PDF_PATH || "./sample.pdf",
        });
      } catch (err) {
        return res.json({ ready: false, error: err.message });
      }
    });

    app.get("/admin/inspect", (req, res) => {
      try {
        const n = parseInt(req.query.top || "10", 10);
        const sample = resources.docs.slice(0, n).map(c => ({ id: c.id, page: c.page, snippet: c.text.slice(0, 400) }));
        return res.json({ chunks: sample });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    app.get("/admin/sim", async (req, res) => {
      try {
        const qRaw = req.query.query;
        if (!qRaw) return res.status(400).json({ error: "query param required" });

        function cleanTextLocal(str) {
          if (!str) return "";
          let s = typeof str.normalize === "function" ? str.normalize("NFKC") : str;
          s = s.replace(/[\x00-\x1F\x7F]+/g, " ");
          s = s.replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (match) => match.replace(/\s/g, ""));
          s = s.replace(/\s+/g, " ");
          s = s.replace(/\s+([.,:;!?%)])/g, "$1");
          return s.trim();
        }

        const q = cleanTextLocal(qRaw);
        const qEmbRaw = await resources.embedder(q, { pooling: "mean", normalize: true });
        const qEmb = Array.isArray(qEmbRaw.data) ? qEmbRaw.data : Array.from(qEmbRaw.data);
        const scored = resources.embeddings.map((emb, i) => ({
          id: resources.docs[i].id,
          page: resources.docs[i].page,
          score: resources.cosineSim(qEmb, emb),
          snippet: resources.docs[i].text.slice(0, 400),
        }));
        scored.sort((a, b) => b.score - a.score);
        return res.json({ top: scored.slice(0, parseInt(req.query.top || "10", 10)) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    const port = parseInt(process.env.PORT || "8000", 10);
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("Failed to initialize LLM:", err);
    process.exit(1);
  });
