'use client' // Next.js: required because this file uses useState (must be the very first line)

import React, { useState } from 'react'

// Text data kept in arrays so it's easy to edit later
const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'PHP', 'TypeScript']

const FEATURES = [
  { icon: '⚡', title: 'Instant conversion', text: 'Paste your code and get the result in seconds.' },
  { icon: '🧠', title: 'AI powered', text: "Understands your code's logic, not just the syntax." },
  { icon: '🌐', title: 'Many languages', text: 'Convert between the most popular languages.' },
  { icon: '🔒', title: 'Private', text: 'Your code is never stored or shared.' },
]

const STEPS = [
  { number: '1', title: 'Paste your code', text: 'Add the code you want to convert.' },
  { number: '2', title: 'Pick languages', text: 'Choose the source and target language.' },
  { number: '3', title: 'Copy the result', text: 'Click convert, then copy your new code.' },
]

const Home = () => {
  // useState stores values that can change; React re-draws the page when they do
  const [from, setFrom] = useState('Python')
  const [to, setTo] = useState('JavaScript')
  const [input, setInput] = useState('print("Hello, world!")')
  const [output, setOutput] = useState('')

  // Runs when "Convert code" is clicked.
  // NOTE: placeholder only! Replace with a real API call to your converter.
  const handleConvert = () => {
    setOutput(`// ${from} -> ${to} (demo output)\n// Connect your real converter here.\n\n${input}`)
  }

  // Swap the two language dropdowns
  const handleSwap = () => {
    setFrom(to)
    setTo(from)
  }

  // Copy the result to the clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div>
      {/* ---------- NAVBAR ---------- */}
      <header className="navbar">
        <a href="/" className="logo">{'</>'} CodeShift</a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#converter" className="btn btn-small">Try it free</a>
        </nav>
      </header>

      <main>
        {/* ---------- HERO + LIVE DEMO ---------- */}
        <section className="hero">
          <h1>
            Convert code between <span className="highlight">any language</span>
          </h1>
          <p className="hero-subtitle">
            Paste your code, pick a language, and get clean, working code back in seconds.
          </p>

          <div className="converter" id="converter">
            {/* Language pickers */}
            <div className="converter-toolbar">
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {LANGUAGES.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>

              <button className="swap-btn" onClick={handleSwap} aria-label="Swap languages">⇄</button>

              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {LANGUAGES.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Input and output boxes side by side */}
            <div className="converter-panels">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your code here..."
                spellCheck="false"
              />
              <textarea
                value={output}
                readOnly
                placeholder="Converted code appears here..."
                spellCheck="false"
              />
            </div>

            <div className="converter-actions">
              <button className="btn" onClick={handleConvert}>Convert code</button>
              {/* Only show the copy button once there is output */}
              {output && (
                <button className="btn btn-outline" onClick={handleCopy}>Copy result</button>
              )}
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="section" id="features">
          <h2>Why developers love CodeShift</h2>
          <div className="grid">
            {/* .map() makes one card for each item in FEATURES */}
            {FEATURES.map((f) => (
              <div className="card" key={f.title}>
                <div className="card-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="section section-alt" id="how-it-works">
          <h2>How it works</h2>
          <div className="grid">
            {STEPS.map((s) => (
              <div className="card" key={s.number}>
                <div className="step-number">{s.number}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- CALL TO ACTION ---------- */}
        <section className="cta">
          <h2>Ready to convert your code?</h2>
          <p>No sign-up needed. Just paste and go.</p>
          <a href="#converter" className="btn btn-light">Start converting</a>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} CodeShift. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home;