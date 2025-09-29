// initialiseLLM.js
import { pipeline } from "@xenova/transformers";
import { loadPdf, chunkTextWithMetadata } from "./pdfLoader.js";
import { loadStore, saveStoreAtomic } from "./persistStore.js";
import fs from "fs";
import crypto from "crypto";

let embedder = null;
let docs = []; // array of chunk objects {id,text,page,...}
let embeddings = []; // array of plain JS arrays
let ready = false;
let storePath = process.env.EMBED_STORE_PATH || "./embed_store.json";
const PDF_PATH = process.env.PDF_PATH || "./sample.pdf";

async function fileHash(filePath) {
  const buff = await fs.promises.readFile(filePath);
  return crypto.createHash("sha256").update(buff).digest("hex");
}

export function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function initializeLLM() {
  if (ready) return; // idempotent
  console.log("initialiseLLM: starting...");

  if (!fs.existsSync(PDF_PATH)) {
    throw new Error("PDF not found at " + PDF_PATH);
  }

  const pdfHash = await fileHash(PDF_PATH);
  const existing = await loadStore(storePath);

  if (existing && existing.pdfHash === pdfHash && existing.chunks && existing.embeddings) {
    console.log("Found persisted embeddings — loading from store.");
    docs = existing.chunks;
    embeddings = existing.embeddings;
  } else {
    console.log("No valid persisted store found or PDF changed. Rebuilding embeddings...");

    const { fullText, pages } = await loadPdf(PDF_PATH);

    if (!fullText || fullText.length < 20) {
      throw new Error("PDF text seems empty or failed to load.");
    }

    console.log("Chunking PDF (sentence-aware)...");
    docs = chunkTextWithMetadata(pages, {
      targetTokens: parseInt(process.env.CHUNK_TOKEN_SIZE || "500", 10),
      overlapTokens: parseInt(process.env.CHUNK_OVERLAP_TOKENS || "100", 10),
    });
    console.log("Chunks created:", docs.length);

    console.log("Loading embedding model...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    console.log("Generating embeddings for chunks...");
    embeddings = [];
    for (let d of docs) {
      const emb = await embedder(d.text, { pooling: "mean", normalize: true });
      const vec = Array.isArray(emb.data) ? emb.data : Array.from(emb.data);
      embeddings.push(vec);
    }
    console.log("Embeddings generated.");

    const toSave = {
      pdfHash,
      createdAt: new Date().toISOString(),
      chunks: docs,
      embeddings,
    };
    await saveStoreAtomic(storePath, toSave);
    console.log("Persisted embeddings to", storePath);
  }

  if (!embedder) {
    console.log("Loading embedder for query-time embeddings...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  ready = true;
  console.log("initializeLLM: ready.");
}

export function getLLMResources() {
  if (!ready) throw new Error("LLM not initialized yet. Call initializeLLM() first.");
  return { embedder, docs, embeddings, cosineSim, ready };
}
