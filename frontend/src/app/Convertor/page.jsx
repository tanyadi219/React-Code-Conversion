"use client";

import axios from "axios";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import * as Babel from "@babel/standalone";

// Base URL of your backend (change it here once, used everywhere below)
const API_URL = "http://localhost:5500";

// Dropdown options: [id Monaco understands, label the user sees]
const LANGUAGES = [
  ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["python", "Python"], ["java", "Java"],
  ["csharp", "C"], ["cpp", "C++"], ["php", "PHP"], ["go", "Go"], ["swift", "Swift"], ["ruby","Ruby"], 
  ["rust","Rust"], ["kotlin","Kotlin"]
];

// Monaco uses "csharp" and "cpp", but the backend expects "c#" and "c++".
// This small map translates between the two. Other languages pass through unchanged.
const API_NAMES = { csharp: "c#", cpp: "c++", clang: "c" };
const toApiName = (id) => API_NAMES[id] || id;

// All colors in one place. "ink" = dark side (matches Monaco vs-dark), "paper" = light result side
const C = {
  ink: "#1e1e1e", inkRaised: "#252526", inkBorder: "#3c3c3c", inkText: "#d4d4d4", inkTextDim: "#858585",
  paper: "#f4f0e6", paperTextDim: "#8c8570", teal: "#2f6f5e", error: "#b3462f",
};

const mono = "'IBM Plex Mono', monospace";
const sans = "'IBM Plex Sans', sans-serif";
const flex = { display: "flex", alignItems: "center" };
const btn = { fontFamily: sans, fontSize: "13px", fontWeight: 600, borderRadius: "6px", padding: "9px 18px" };
const col = { display: "flex", flexDirection: "column", minWidth: 0 };

// Inline styles (the responsive rules live in the <style> block below)
const s = {
  page: { ...col, height: "100dvh", width: "100%", overflow: "hidden", fontFamily: sans, background: C.ink },
  header: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${C.inkBorder}`, flexShrink: 0 },
  brand: { ...flex, gap: "10px" },
  brandMark: { fontFamily: mono, color: C.teal, fontSize: "16px" },
  brandName: { color: C.inkText, fontSize: "15px", fontWeight: 600 },
  status: { ...flex, justifyContent: "flex-end", gap: "8px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%" },
  mono12: { fontFamily: mono, fontSize: "12px", color: C.inkTextDim },
  langBar: { ...flex, justifyContent: "center", flexWrap: "wrap", gap: "14px" },
  langGroup: { ...flex, gap: "8px" },
  label: { fontFamily: mono, fontSize: "11px", letterSpacing: "0.12em", color: C.inkTextDim },
  select: { fontFamily: sans, fontSize: "13px", fontWeight: 500, color: C.inkText, background: C.inkBorder, border: `1px solid ${C.inkBorder}`, borderRadius: "6px", padding: "7px 12px", cursor: "pointer", outline: "none" },
  swap: { fontFamily: mono, fontSize: "14px", color: C.teal, background: "transparent", border: `1px solid ${C.inkBorder}`, borderRadius: "6px", padding: "6px 10px", cursor: "pointer" },
  body: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 0 },
  inkPane: { ...col, background: C.ink },
  paperPane: { ...col, background: C.paper },
  spine: { background: `repeating-linear-gradient(to bottom, ${C.inkBorder} 0, ${C.inkBorder} 6px, transparent 6px, transparent 12px)` },
  editorWrap: { flex: 1, minHeight: 0, borderTop: `1px solid ${C.inkBorder}`, borderBottom: `1px solid ${C.inkBorder}` },
  toolbar: { display: "flex", flexWrap: "wrap", gap: "10px", padding: "14px 20px", background: C.inkRaised, flexShrink: 0 },
  run: { ...btn, color: "#eafaf4", background: C.teal, border: "none", cursor: "pointer" },
  // NEW: style for the Convert button (outlined teal so it differs from "Run JSX")
  convert: { ...btn, color: C.teal, background: "transparent", border: `1px solid ${C.teal}` },
  save: { ...btn, color: C.inkText, background: "transparent", border: `1px solid ${C.inkBorder}` },
  preview: { flex: 1, overflow: "auto", padding: "28px" },
  empty: { height: "100%", ...flex, justifyContent: "center", textAlign: "center" },
  emptyText: { color: C.paperTextDim, fontSize: "14px", maxWidth: "280px", lineHeight: 1.6 },
  errCard: { background: "#fdf1ec", border: `1px solid ${C.error}`, borderRadius: "8px", padding: "16px 18px" },
  errTitle: { fontFamily: mono, fontSize: "12px", fontWeight: 600, color: C.error, marginBottom: "8px" },
  errBody: { fontFamily: mono, fontSize: "12.5px", color: "#7a2e1f", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 },
  // NEW: styles for the converted-code view
  convHead: { ...flex, justifyContent: "space-between", marginBottom: "10px" },
  copy: { ...btn, padding: "5px 12px", fontSize: "12px", color: C.teal, background: "transparent", border: `1px solid ${C.teal}`, cursor: "pointer" },
  convEditor: { height: "calc(100% - 40px)", minHeight: "300px", borderRadius: "8px", overflow: "hidden" },
};

// Starter code shown in the editor
const defaultCode = `
function CustomComponent() {
  return (
    <div style={{ padding: "30px", borderRadius: "12px", background: "#f5f5f5", textAlign: "center" }}>
      <h1>Hello from Monaco 🚀</h1>
      <p>This component is rendered dynamically.</p>
      <button onClick={() => alert("Hello!")}>Click Me</button>
    </div>
  );
}

render(<CustomComponent />);
`;

// One reusable dropdown, used for both FROM and TO
const LangSelect = ({ label, value, onChange }) => (
  <div style={s.langGroup}>
    <span style={s.label}>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={s.select}>
      {LANGUAGES.map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </select>
  </div>
);

export default function JSXRenderer() {
  const [code, setCode] = useState(defaultCode);       // text inside the editor
  const [Component, setComponent] = useState(null);    // the compiled component
  const [error, setError] = useState("");              // error message, if any
  const [errorTitle, setErrorTitle] = useState("Didn't compile"); // NEW: heading of the error card
  const [saving, setSaving] = useState(false);         // true while saving
  const [fromLang, setFromLang] = useState("javascript");
  const [toLang, setToLang] = useState("typescript");

  // NEW: state for the conversion feature
  const [converted, setConverted] = useState("");          // the converted code from the backend
  const [convertedLang, setConvertedLang] = useState("");  // language the converted code is in
  const [converting, setConverting] = useState(false);     // true while waiting for the backend

  // Turn the editor text into a real React element and show it
  const renderCode = () => {
    try {
      setError("");
      setConverted(""); // NEW: hide the converted code so the live preview shows again
      const js = Babel.transform(code, { presets: ["react"] }).code; // JSX -> plain JavaScript
      // Run it with a small render() helper that captures the element
      const run = new Function("React", `let result = null; const render = (el) => { result = el; }; ${js}\nreturn result;`);
      const element = run(React);
      if (!element) throw new Error("Your code must call render(<YourComponent />)");
      setComponent(() => () => element);
    } catch (err) {
      setErrorTitle("Didn't compile");
      setError(err.message);
      setComponent(null);
    }
  };

  // NEW: send the code to the backend and get it back in the other language
  const convertCode = async () => {
    // Quick checks before calling the server
    if (!code.trim()) {
      setErrorTitle("Can't convert");
      setError("Write some code first.");
      return;
    }
    if (fromLang === toLang) {
      setErrorTitle("Can't convert");
      setError("Pick two different languages.");
      return;
    }

    setConverting(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/gemini/convert`, {
        code,
        fromLanguage: toApiName(fromLang), // e.g. "csharp" becomes "c#"
        toLanguage: toApiName(toLang),
      });

      setConverted(res.data.convertedCode); // backend sends { convertedCode: "..." }
      setConvertedLang(toLang);             // remember the language for syntax highlighting
    } catch (err) {
      console.log(err);
      setErrorTitle("Conversion failed");
      // Show the backend's message if there is one, otherwise the generic axios message
      setError(err.response?.data?.message || err.message);
      setConverted("");
    } finally {
      setConverting(false); // always turn the "Converting…" state off
    }
  };

  // NEW: copy the converted code to the clipboard
  const copyConverted = async () => {
    try {
      await navigator.clipboard.writeText(converted);
      alert("Copied!");
    } catch (err) {
      alert("Could not copy");
    }
  };

  // Send the code to the backend
  const saveComponent = async () => {
    setSaving(true);
    try {
      // The login page saved the user in localStorage, so read it back here
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?._id || user?.id; // the id MongoDB gave this user
      if (!userId) {
        alert("Please log in first");
        return; // stop here (the finally block below still turns "Saving…" off)
      }

      // Send the user's id together with the code, because the backend requires it
      const res = await axios.post(`${API_URL}/component/add`, { code, user: userId });
      console.log("Component saved:", res.data);
      alert("Component saved successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to save component");
    } finally {
      setSaving(false);
    }
  };

  // Header status: [text, dot color]
  const [statusText, statusColor] = error
    ? ["Error", C.error]
    : converting
    ? ["Converting…", C.inkTextDim]
    : converted
    ? ["Converted", C.teal]
    : Component
    ? ["Rendered", C.teal]
    : ["Not run yet", C.inkTextDim];

  return (
    <div className="jsx-page" style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #1e1e1e; }
        .jsx-editor .monaco-editor, .jsx-editor .overflow-guard { border-radius: 0 !important; }
        @keyframes stamp-in { from { opacity: 0; transform: scale(0.9) rotate(-2deg); } to { opacity: 1; transform: scale(1) rotate(-2deg); } }

        /* Tablets and phones: page scrolls, panes stack, header becomes two rows */
        @media (max-width: 900px) {
          .jsx-page { height: auto !important; min-height: 100dvh; overflow: auto !important; }
          .jsx-header { grid-template-columns: 1fr auto !important; padding: 12px 16px !important; row-gap: 10px; }
          .jsx-brand { grid-column: 1; grid-row: 1; }
          .jsx-status { grid-column: 2; grid-row: 1; }
          .jsx-lang { grid-column: 1 / -1; grid-row: 2; }
          .jsx-body { grid-template-columns: 1fr !important; }
          .jsx-spine { height: 1px; background: #3c3c3c !important; }
          .jsx-editor { flex: none !important; height: 55vh !important; min-height: 280px; }
          .jsx-preview { min-height: 300px; padding: 16px !important; }
        }
        @media (max-width: 480px) { .jsx-lang { gap: 8px !important; } }
      `}</style>

      {/* HEADER: logo | FROM ⇄ TO | status */}
      <header className="jsx-header" style={s.header}>
        <div className="jsx-brand" style={s.brand}>
          <span style={s.brandMark}>{"</>"}</span>
          <span style={s.brandName}>JSX Studio</span>
        </div>

        <div className="jsx-lang" style={s.langBar}>
          <LangSelect label="FROM" value={fromLang} onChange={setFromLang} />
          <button
            onClick={() => { setFromLang(toLang); setToLang(fromLang); }} // swap the two languages
            style={s.swap}
            title="Swap languages"
          >
            ⇄
          </button>
          <LangSelect label="TO" value={toLang} onChange={setToLang} />
        </div>

        <div className="jsx-status" style={s.status}>
          <span style={{ ...s.dot, background: statusColor }} />
          <span style={s.mono12}>{statusText}</span>
        </div>
      </header>

      <div className="jsx-body" style={s.body}>
        {/* LEFT: editor + buttons */}
        <section style={s.inkPane}>
          <div style={{ ...s.label, padding: "10px 20px" }}>WRITE</div>

          <div className="jsx-editor" style={s.editorWrap}>
            <Editor
              height="100%"
              language={fromLang}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: mono, automaticLayout: true, padding: { top: 16 } }}
            />
          </div>

          <div style={s.toolbar}>
            <button onClick={renderCode} style={s.run}>▸ Run JSX</button>

            {/* NEW: Convert button, disabled while the request is running */}
            <button
              onClick={convertCode}
              disabled={converting}
              style={{ ...s.convert, opacity: converting ? 0.6 : 1, cursor: converting ? "default" : "pointer" }}
            >
              {converting ? "Converting…" : "⇄ Convert"}
            </button>

            <button
              onClick={saveComponent}
              disabled={saving}
              style={{ ...s.save, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
            >
              {saving ? "Saving…" : "Save Component"}
            </button>
          </div>
        </section>

        <div className="jsx-spine" style={s.spine} />

        {/* RIGHT: result (error, converted code, rendered component, or empty message) */}
        <section style={s.paperPane}>
          <div style={{ ...s.label, padding: "10px 20px", color: C.paperTextDim }}>RESULT</div>

          <div className="jsx-preview" style={s.preview}>
            {error ? (
              <div style={s.errCard}>
                <div style={s.errTitle}>{errorTitle}</div>
                <pre style={s.errBody}>{error}</pre>
              </div>
            ) : converted ? (
              // NEW: converted code shown in a read-only editor
              <>
                <div style={s.convHead}>
                  <span style={{ ...s.label, color: C.paperTextDim }}>
                    CONVERTED TO {(LANGUAGES.find(([id]) => id === convertedLang)?.[1] || convertedLang).toUpperCase()}
                  </span>
                  <button onClick={copyConverted} style={s.copy}>Copy</button>
                </div>
                <div style={s.convEditor}>
                  <Editor
                    height="100%"
                    language={convertedLang}
                    theme="vs-dark"
                    value={converted}
                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, fontFamily: mono, automaticLayout: true, padding: { top: 16 } }}
                  />
                </div>
              </>
            ) : Component ? (
              <div style={{ animation: "stamp-in 0.25s ease-out" }}>
                <Component />
              </div>
            ) : (
              <div style={s.empty}>
                <p style={s.emptyText}>
                  Nothing here yet — write some code, then hit <strong>Run JSX</strong> to preview it or <strong>Convert</strong> to change its language.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}