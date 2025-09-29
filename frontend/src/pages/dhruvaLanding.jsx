import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import hook
import dhruvaImg from "../assets/dhruva.png";
import dhruvaLast from "../assets/dhruva_last.png";
import chat from "../assets/chat.jpeg";

export default function DhruvaLanding() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate(); // ✅ initialize

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const goToChat = () => navigate("/chat"); // ✅ reusable

  const sidebarItems = [
    { t: "Languages", n: "01", content: ["English", "Hindi", "Tamil"] },
    {
      t: "FAQs",
      n: "02",
      content: [
        "Q: How many blocks are there at Vels?",
        "A: 10+ blocks",
        "Q: When is Vels Stars?",
        "A: It is scheduled on September end every year",
      ],
    },
    {
      t: "Tech Stack",
      n: "03",
      content: [
        "Frontend: React, Tailwind CSS",
        "Backend: Node.js, Express.js",
        "AI: Xenova-Transformer, OpenAI API, OpenRouter",
      ],
    },
    {
      t: "Future Scope",
      n: "04",
      content: [
        "Voice-to-voice translation",
        "Multi-turn-Contextual chat",
        "Mobile app development",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#120906] text-[#f3a65a] font-sans overflow-x-hidden">
      {/* ===== bottom watermark ===== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center"
      >
        <img
          src={dhruvaLast}
          alt=""
          className="w-full max-w-[1600px] object-cover opacity-10 blur-[1px]"
        />
      </div>

      {/* ===== header / hero ===== */}
      <header
        className="relative overflow-hidden px-6 md:px-12 lg:px-24 pt-10 pb-28"
        style={{
          background:
            "radial-gradient(1200px 500px at 10% 10%, rgba(255,140,60,0.12), transparent 6%), radial-gradient(800px 300px at 90% 20%, rgba(255,120,40,0.08), transparent 8%)",
        }}
      >
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={dhruvaImg} alt="logo" className="w-24 h-24 object-contain" />
            <span className="font-bold tracking-wide text-lg">DHRUVA.AI</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={goToChat}
              className="text-xs uppercase tracking-wide px-4 py-2 rounded-md bg-[#f08a3a] text-black font-semibold"
            >
              Try Dhruva.ai
            </button>
          </div>
        </nav>

        <main className="mt-12 text-center">
          <h1 className="mx-auto text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ca5506] to-[#ff7e2b] drop-shadow-[0_12px_30px_rgba(255,120,40,0.14)]">
            DHRUVA.AI
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xs text-[#f6f0ea] opacity-80 tracking-widest">
            Your guiding star in the academic universe. Bringing clarity, support, and direction to students whenever they need it.
          </p>

          {/* Search box */}
          <div className="mt-8 flex justify-center">
            <div
              onClick={goToChat}
              className="w-full max-w-3xl cursor-pointer rounded-xl bg-[#131214]/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-[#2a2522]"
            >
              <div className="flex items-center gap-4">
                <input
                  className="flex-1 bg-transparent outline-none text-[#eae0d8] placeholder-[#9d7b62] text-sm tracking-wide px-3 py-4 cursor-pointer"
                  placeholder="Ask anything..."
                  readOnly
                />
                <div className="flex items-center gap-3">
                  <button className="px-3 py-2 rounded-md bg-[#2f241e] text-xs">Mgr Block</button>
                  <button className="px-3 py-2 rounded-md bg-[#2f241e] text-xs">? Fee Deadline</button>
                  <button className="ml-2 px-4 py-2 rounded-md bg-gradient-to-br from-[#ff9146] to-[#ff6b1a] text-black font-semibold">
                    ⮕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={goToChat}
              className="text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-[#f08a3a] text-black font-semibold"
            >
              Your journey begins here
            </button>
          </div>
        </main>
      </header>

      {/* ===== stats ===== */}
      <section className="px-6 md:px-12 lg:px-24 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { title: "7+", subtitle: "Regional Languages" },
            { title: "300+", subtitle: "Students Helped" },
            { title: "1000+", subtitle: "Queries Answered" },
            { title: "24/7", subtitle: "All Day Availability" },
          ].map((c, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 relative border border-[#2a1f18] shadow-[0_18px_60px_rgba(255,100,20,0.1)] bg-gradient-to-br from-[#1a0f0c] via-[#2b1c15] to-[#0c0908] overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-[0_25px_80px_rgba(255,140,40,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6a1a]/20 via-transparent to-[#ff9e5a]/10 pointer-events-none" />
              <div className="relative z-10 text-3xl font-bold tracking-wide text-[#ffb07a]">{c.title}</div>
              <div className="relative z-10 mt-6 uppercase text-xs tracking-wider text-[#f7e6d7]">{c.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== meet section ===== */}
      <section className="px-6 md:px-12 lg:px-24 mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1">
          <div className="p-6 rounded-lg bg-gradient-to-br from-[#0f0d0c] to-[#120b08] border border-[#231815] shadow-inner">
            <div className="flex items-center gap-4">
              <img src={dhruvaImg} alt="Dhruva logo" className="w-24 h-24 object-contain rounded-full" />
              <div className="flex-1">
                <div className="text-xs uppercase text-[#f6d6b6] tracking-wider">Ask anything...</div>
              </div>
              <button className="px-3 py-3 rounded-md bg-[#2f241d]">🔊</button>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 text-right">
          <h2 className="text-2xl font-extrabold tracking-wide text-[#f9a56b]">Meet Dhruva.ai</h2>
          <p className="mt-4 text-sm text-[#e8dfd6] opacity-90 leading-relaxed">
            A multilingual AI assistant built to simplify campus communication by answering FAQs in regional languages, reducing student stress and staff workload.
          </p>
          <div className="mt-6 text-right">
            <button
              onClick={goToChat}
              className="px-4 py-2 rounded-md bg-[#f08a3a] text-black font-semibold"
            >
              Try Dhruva.ai
            </button>
          </div>
        </div>
      </section>

      {/* ===== sidebar nav + collapsible ===== */}
      <section className="px-6 md:px-12 lg:px-24 mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <aside className="md:col-span-1">
          <nav className="space-y-4">
            {sidebarItems.map((item, idx) => (
              <div key={item.t} className="rounded overflow-hidden">
                <div
                  onClick={() => toggle(idx)}
                  className="relative flex items-center justify-between px-6 py-4 cursor-pointer border border-[#241816] shadow-[inset_0_6px_20px_rgba(0,0,0,0.6)] bg-gradient-to-r from-[#1a0f0c] via-[#2a1a13] to-[#0e0c0b] transform transition duration-300 hover:scale-105 hover:shadow-[0_25px_80px_rgba(255,140,40,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff7a29]/20 via-transparent to-[#ffb770]/10 pointer-events-none" />
                  <span className="relative z-10 uppercase tracking-wider font-semibold">{item.t}</span>
                  <span className="relative z-10 text-sm text-[#b56a39]">{openIndex === idx ? "▼" : item.n}</span>
                </div>
                {openIndex === idx && (
                  <div className="bg-[#0f0d0c] border-l border-r border-b border-[#241816] px-6 py-4 text-sm text-[#f6d6b6] space-y-2">
                    {item.content.map((line, i) => (
                      <p key={i} className="leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <div className="md:col-span-2">
          <div className="w-full h-80 rounded-lg overflow-hidden">
            <img src={chat} alt="Dhruva Chat Preview" className="w-full h-full object-contain" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-24 mt-20 text-center">
  <h3 className="text-lg font-bold text-[#f6d6b6] mb-2">
    Dhruva doesn’t know all the answers yet...
  </h3>
  <p className="text-sm text-[#e8dfd6] opacity-80 max-w-xl mx-auto mb-4">
    Help us improve Dhruva! By contributing correct information, you make this assistant smarter and more helpful for every student.
  </p>
  <button
    onClick={() => navigate("/improve")}
    className="px-6 py-3 rounded-md bg-gradient-to-br from-[#ff9146] to-[#ff6b1a] text-black font-semibold shadow-lg hover:scale-105 transition"
  >
    Help Us Improve Dhruva
  </button>
</section>

      {/* ===== footer ===== */}
      <footer className="relative w-full mt-40">
        <div className="w-full flex justify-center">
          <img src={dhruvaLast} alt="Dhruva footer logo" className="w-full max-w-[1800px] object-contain opacity-90 translate-y-10" />
        </div>
      </footer>
    </div>
  );
}
