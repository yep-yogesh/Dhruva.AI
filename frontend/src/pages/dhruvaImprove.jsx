import React, { useState } from "react";

export default function ImproveDhruva() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send email to backend or Google Form
    alert(`Thanks for contributing! We’ll reach out at: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0d0c] text-[#f6d6b6] px-6">
      <div className="max-w-lg w-full bg-[#1a0f0c] border border-[#2a1f18] rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-[#f08a3a]">
          Help Improve Dhruva
        </h2>
        <p className="text-sm text-center text-[#e8dfd6] opacity-90 mb-6">
          Dhruva doesn’t know all the questions yet.  
          We’d love it if you could actively contribute with the right information 
          so Dhruva becomes smarter and more helpful for everyone!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">Enter your email ID</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2 rounded-md bg-[#0f0d0c] border border-[#3a2a1f] text-[#f6d6b6] focus:outline-none focus:border-[#f08a3a]"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-gradient-to-br from-[#ff9146] to-[#ff6b1a] text-black font-semibold hover:scale-105 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
