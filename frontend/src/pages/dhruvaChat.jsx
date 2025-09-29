import React, { useEffect, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import dhruvaLogo from "../assets/dhruva.png";

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function DhruvaChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Hello! I'm Dhruva. Ask me anything about campus life. I will try my best to help you!",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  async function askDhruva(question) {
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(`Server error: ${res.status} ${txt || ""}`);
    }
    return res.json();
  }

  function renderMessageText(text) {
    if (!text) return null;
    const paragraphs = text.split(/\n{2,}/).map((p) => p.trim());
    return (
      <>
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line leading-relaxed">
            {p}
          </p>
        ))}
      </>
    );
  }

  const send = async (text) => {
    const t = (text || "").trim();
    if (!t) return;
    const userMsg = { id: Date.now() + "-u", role: "user", text: t, time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const data = await askDhruva(t);
      const answerText =
        (data && (data.answer || data.message || data.result)) || "No answer returned.";
      const botMsg = {
        id: Date.now() + "-b",
        role: "bot",
        text: answerText,
        time: now(),
        meta: data.meta,
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      console.error("askDhruva error:", err);
      const errMsg = {
        id: Date.now() + "-be",
        role: "bot",
        text: "⚠️ Sorry — couldn't reach the server. Try again later.",
        time: now(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !sending) send(input.trim());
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-[#f3a65a] font-sans">
      {/* background gradient */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `
            linear-gradient(to bottom, #000000 0%, #1a0c05 100%),
            radial-gradient(800px 300px at 10% 6%, rgba(255,140,60,0.12), transparent 8%),
            radial-gradient(900px 360px at 85% 8%, rgba(255,120,40,0.06), transparent 12%)
          `,
        }}
      />

      {/* left vertical bar */}
      <div className="absolute left-0 top-0 h-full w-14 md:w-16 bg-gradient-to-b from-[#5b2f18] to-[#3a1e12] -z-5" />

      {/* header */}
      <header className="flex items-center gap-6 px-6 md:px-12 py-8">
        <div className="flex items-center gap-4">
          <img
            src={dhruvaLogo}
            alt="logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
          />
          <h1 className="hidden md:block text-xl md:text-2xl font-bold tracking-widest text-[#f08a3a]">
            HELLO I'M DHRUVA
          </h1>
        </div>
      </header>

      {/* messages */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 pb-48">
        <div
          ref={listRef}
          className="min-h-[60vh] max-h-[65vh] overflow-y-auto py-12 flex flex-col gap-12"
        >
          {messages.map((m) =>
            m.role === "bot" ? (
              <div key={m.id} className="flex items-start gap-6 md:gap-10">
                <img
                  src={dhruvaLogo}
                  alt="D"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
                <div className="bg-gradient-to-br from-[#2b1208] via-[#4a1f0f] to-[#8a3a1a] rounded-xl border border-orange-700/30 p-8 md:p-10 w-full md:max-w-2xl shadow-[0_6px_30px_rgba(255,110,50,0.06)]">
                  <div className="text-base md:text-lg text-[#ffe6d6]">
                    {renderMessageText(m.text)}
                  </div>
                  {m.meta && (
                    <div className="text-xs text-[#e0b388] mt-4 text-right">
                      <span className="opacity-80">method: {m.meta.method || "—"}</span>
                    </div>
                  )}
                  <div className="text-xs text-[#e0b388] mt-2 text-right">{m.time}</div>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-end justify-end gap-6 md:gap-10">
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#222226] to-[#0e0e0e] rounded-xl border border-[#bfbfbf]/10 p-8 md:p-10 w-full md:max-w-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="text-base md:text-lg text-[#d7d7d7]">{m.text}</div>
                    <div className="text-xs text-[#8f8f8f] mt-4 text-right">{m.time}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      {/* composer */}
      <form
        onSubmit={onSubmit}
        className="fixed left-0 right-0 bottom-6 md:bottom-10 px-6 md:px-12 flex justify-center z-20"
      >
        <div className="w-full max-w-5xl flex items-center gap-4">
          <img
            src={dhruvaLogo}
            alt="logo"
            className="w-14 h-14 md:w-16 md:h-16 object-contain"
          />
          <div className="flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending && input.trim()) send(input.trim());
                }
              }}
              placeholder="ASK ANYTHING..."
              className="w-full rounded-xl px-6 py-5 bg-gradient-to-br from-[#28130d] via-[#3b1b0e] to-[#542b16] placeholder-[#f1b07a] text-[#fde7d2] outline-none border border-orange-700/30 shadow-[0_8px_40px_rgba(255,100,40,0.06)]"
            />
            <div className="mt-3 flex gap-3 items-center">
              <button
                type="button"
                onClick={() => setInput("Mgr Block")}
                className="text-xs px-3 py-2 rounded-md bg-[#2a150f]/80 border border-orange-700/20 text-[#f6d6b6]"
              >
                📍 MGR BLOCK
              </button>
              <button
                type="button"
                onClick={() => setInput("Fee Deadline")}
                className="text-xs px-3 py-2 rounded-md bg-[#2a150f]/80 border border-orange-700/20 text-[#f6d6b6]"
              >
                ? FEE DEADLINE
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Mic pressed")}
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#000] flex items-center justify-center text-black border border-white/5"
            >
              <Mic size={18} className="text-[#f08a3a]" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff9146] to-[#ff6b1a] flex items-center justify-center text-black shadow-md disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
