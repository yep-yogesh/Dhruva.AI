// pdfLoader.js
import fs from "fs";

/**
 * Try a few different import paths for pdfjs-dist so this file works across
 * different installations / packaging layouts.
 */
async function importPdfJs() {
  const candidates = [
    "pdfjs-dist/legacy/build/pdf.js",
    "pdfjs-dist/legacy/build/pdf.mjs",
    "pdfjs-dist/build/pdf.js",
    "pdfjs-dist/build/pdf.mjs",
    "pdfjs-dist"
  ];

  for (const p of candidates) {
    try {
      const mod = await import(p);
      return mod.default || mod;
    } catch (e) {
      // try next
    }
  }

  throw new Error(
    "Could not import pdfjs-dist. Install it (npm i pdfjs-dist) and make sure Node supports ESM."
  );
}

/* aggressive cleaner similar to what we discussed */
export function cleanPageText(s) {
  if (!s) return "";
  s = typeof s.normalize === "function" ? s.normalize("NFKC") : s;
  s = s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]+/g, " ");
  s = s.replace(/(?:\+\s?(?:\d\s?){6,}\d)/g, (m) => m.replace(/\s/g, ""));
  s = s.replace(/\b(?:\d\s){2,}\d\b/g, (m) => m.replace(/\s/g, ""));
  s = s.replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (m) => m.replace(/\s/g, ""));
  s = s.replace(/\b(?:[A-Za-z0-9]\s){2,}[A-Za-z0-9]\b/g, (m) => m.replace(/\s/g, ""));
  s = s.replace(/\b([A-Z])\s+([a-z]{2,})/g, (_m, a, b) => a + b);
  s = s.replace(/\s+([.,:;!?%)])/g, "$1");
  s = s.replace(/\(\s+/g, "(");
  s = s.replace(/\s+\)/g, ")");
  s = s.replace(/\s+/g, " ");
  return s.trim();
}

export async function loadPdf(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("PDF not found: " + filePath);
  const pdfjs = await importPdfJs();

  // Defensive: pdfjs-dist may try to polyfill canvas APIs; warnings are OK for text extraction.
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjs.GlobalWorkerOptions.workerSrc || "";
  }

  // Read file and ensure we pass a plain Uint8Array (pdfjs requires this)
  const rawBuffer = await fs.promises.readFile(filePath);
  // Create a fresh Uint8Array copy (this avoids issues where Buffer subclasses confuse pdfjs)
  const data = new Uint8Array(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength);
  // Note: `new Uint8Array(rawBuffer)` would also work, but this view avoids an extra copy in many engines.

  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;

  const pages = [];
  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map(i => i.str || i.unicode || "").join(" ");
    pages.push(cleanPageText(strings));
  }

  const fullText = pages.join("\n");
  return { fullText, pages };
}

/* conservative token estimator (1 token ≈ 4 chars) */
export function approxTokensFromChars(chars) {
  if (!chars) return 0;
  return Math.ceil(chars.length / 4);
}

/* chunker: returns array of {id, text, page, startChar, endChar} */
export function chunkTextWithMetadata(textPages, opts = {}) {
  const { targetTokens = 500, overlapTokens = 100 } = opts;
  const pages = textPages;
  const allChunks = [];
  let globalCharIdx = 0;
  let chunkId = 0;

  for (let p = 0; p < pages.length; p++) {
    const pageText = pages[p] || "";
    if (!pageText.trim()) {
      globalCharIdx += pageText.length + 1;
      continue;
    }

    const sentenceRegex = /[^.!?]+[.!?]?(?:\s+|$)/g;
    const sentences = pageText.match(sentenceRegex) || [pageText];

    let current = "";
    let currentStart = globalCharIdx;
    for (let s of sentences) {
      const sTrim = s.trim();
      if (!sTrim) {
        globalCharIdx += s.length;
        continue;
      }
      if (current === "") currentStart = globalCharIdx;

      const wouldBeTokens = approxTokensFromChars((current ? current + " " : "") + sTrim);
      if (wouldBeTokens <= targetTokens) {
        current = (current + " " + sTrim).trim();
      } else {
        if (current) {
          const chunk = {
            id: `chunk_${chunkId++}`,
            text: current,
            page: p + 1,
            startChar: currentStart,
            endChar: currentStart + current.length,
          };
          allChunks.push(chunk);
        }

        const overlapChars = overlapTokens * 4;
        const overlap = current.slice(-overlapChars) || "";
        current = (overlap + " " + sTrim).trim();
        currentStart = globalCharIdx - (overlap ? overlap.length : 0);
      }

      globalCharIdx += s.length;
    }

    if (current && current.trim()) {
      const chunk = {
        id: `chunk_${chunkId++}`,
        text: current.trim(),
        page: p + 1,
        startChar: currentStart,
        endChar: currentStart + current.length,
      };
      allChunks.push(chunk);
    }

    globalCharIdx += 1;
  }

  return allChunks;
}
