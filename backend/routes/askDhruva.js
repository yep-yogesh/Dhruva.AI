// routes/askDhruva.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
if (!OPENROUTER_KEY) throw new Error("Missing OPENROUTER_KEY in .env");
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.65");
const DESIRED_OUTPUT_TOKENS = parseInt(process.env.DESIRED_OUTPUT_TOKENS || "200", 10);
const MIN_OUTPUT_TOKENS = parseInt(process.env.MIN_OUTPUT_TOKENS || "16", 10);
const MAX_PROMPT_TOKENS = parseInt(process.env.MAX_PROMPT_TOKENS || "800", 10);

const ESCALATE_ON_LOW_CONF = process.env.ESCALATE_ON_LOW_CONF === "true";

function approxTokensFromText(text) {
  return text ? Math.ceil(text.length / 4) : 0;
}

async function callOpenRouter(payload) {
  try {
    const r = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  } catch (err) {
    console.error("callOpenRouter fetch error:", err);
    return { status: 500, data: { error: err.message } };
  }
}

function cleanTextLocal(str) {
  if (!str) return "";
  let s = typeof str.normalize === "function" ? str.normalize("NFKC") : str;
  s = s.replace(/[\x00-\x1F\x7F]+/g, " ");
  s = s.replace(/\s+/g, " ");
  return s.trim();
}

function extractSearchTerms(q) {
  const stop = new Set([
    "who","what","when","where","why","how","should","i","to","be","a","the","in","of","for","is","are","me","with",
    "please","want","join","part","contact","do","does","can","on","at","and","or","by","from"
  ]);
  return (q || "")
    .toLowerCase()
    .match(/\b[a-z0-9]+\b/g)
    ?.filter(t => t.length >= 3 && !stop.has(t)) || [];
}

// Extract "Music Club" style phrases
function extractClubPhrasesFromDocs(docs) {
  const set = new Set();
  if (!docs) return [];
  const re1 = /(?:\d+\.\s*)?([A-Za-z&'’\-\s]{2,}Club)\b/gi;
  for (const d of docs) {
    let m;
    const txt = (d.text || "").replace(/\r|\t/g, " ");
    while ((m = re1.exec(txt)) !== null) {
      set.add(m[1].toLowerCase().replace(/\s+/g, " ").trim());
    }
  }
  return Array.from(set);
}

// Only exact match fallback (removed fuzzy)
function exactMatchFallback(query, docs) {
  const q = cleanTextLocal(query).toLowerCase();
  const terms = extractSearchTerms(q);
  const phraseCandidates = extractClubPhrasesFromDocs(docs);

  for (let phrase of phraseCandidates) {
    if (q.includes(phrase)) {
      for (let d of docs) {
        if ((d.text || "").toLowerCase().includes(phrase)) {
          return { chunk: d, reason: "phrase_match", phrase };
        }
      }
    }
  }

  // fallback: keyword count
  let best = null;
  for (let d of docs) {
    const dt = (d.text || "").toLowerCase();
    let hits = terms.filter(t => dt.includes(t)).length;
    if (!best || hits > best.hits) best = { chunk: d, hits };
  }
  if (best && best.hits > 0) {
    return { chunk: best.chunk, reason: "keyword_match", matchCount: best.hits };
  }
  return null;
}

export function askRoute(resources) {
  return async (req, res) => {
    try {
      const { embedder, docs, embeddings, cosineSim } = resources;
      const queryRaw = req.body.question;
      if (!queryRaw) return res.status(400).json({ error: "No question provided" });

      const query = cleanTextLocal(queryRaw);
      const exact = exactMatchFallback(query, docs);

      if (exact && exact.chunk) {
        const context = exact.chunk.text;
        const messages = [
          { role: "system", content: "You are Dhruva, a helpful campus assistant. Answer using only the context. If unsure, say so and include source id and page." },
          { role: "user", content: `Context:\n${context}\n\nQuestion: ${queryRaw}` },
        ];
        const payload = { model: "gpt-4o-mini", max_tokens: 120, messages };
        const { status, data } = await callOpenRouter(payload);
        if (status >= 200 && status < 300 && data?.choices?.[0]) {
          return res.json({
            answer: data.choices[0].message?.content || data.choices[0].text || "",
            meta: { method: exact.reason, phrase: exact.phrase || null, chunkId: exact.chunk.id, page: exact.chunk.page }
          });
        }
      }

      // fallback: embeddings retrieval (no fuzzy boosting)
      const qEmbRaw = await embedder(query, { pooling: "mean", normalize: true });
      const qEmb = Array.isArray(qEmbRaw.data) ? qEmbRaw.data : Array.from(qEmbRaw.data);

      const scored = embeddings.map((emb, i) => ({
        score: cosineSim(qEmb, emb),
        text: docs[i].text,
        id: docs[i].id,
        page: docs[i].page
      }));
      scored.sort((a,b) => b.score - a.score);
      const topK = scored.slice(0, 6);

      if (!topK.length) return res.json({ answer: "No relevant info found." });

      const context = topK.map(c => `[Chunk ${c.id} | page:${c.page}]\n${c.text}`).join("\n");
      const messages = [
        { role: "system", content: "You are Dhruva, a helpful campus assistant. Use only the provided context to answer." },
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${queryRaw}` },
      ];
      const payload = { model: "gpt-4o-mini", max_tokens: 120, messages };
      const { status, data } = await callOpenRouter(payload);

      if (status >= 200 && status < 300 && data?.choices?.[0]) {
        return res.json({
          answer: data.choices[0].message?.content || data.choices[0].text || "",
          meta: { method: "embedding_retrieval", topChunks: topK.map(c => ({ id: c.id, page: c.page, score: c.score })) }
        });
      }

      res.status(500).json({ error: "Failed to get response from OpenRouter" });

    } catch (err) {
      console.error("Error in /ask:", err);
      res.status(500).json({ error: err.message });
    }
  };
}
