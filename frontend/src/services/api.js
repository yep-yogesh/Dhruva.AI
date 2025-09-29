// src/services/api.js
export async function askDhruva(question) {
  const res = await fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error("Failed to fetch answer");
  return res.json(); // { answer, meta }
}
