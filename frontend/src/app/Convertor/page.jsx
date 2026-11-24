"use client";

import axios from "axios";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import * as Babel from "@babel/standalone";

/* ============================================================
   1. SETTINGS (things you might want to change later)
   ============================================================ */

// Address of your backend. Change it here once and it updates everywhere.
const API_URL = "http://localhost:5500";

// ALL the page colors live here. Change a value once and it updates everywhere.
const THEME = {
  editor: "my-dark",                    // our custom editor theme (defined below)
  page: "bg-[#2b2b2f]",                 // main page background
  result: "bg-[#262629]",               // right panel (slightly darker, so the two sides are easy to tell apart)
  border: "border-[#45454b]",           // all the thin divider lines
  label: "text-gray-400",               // small labels: FROM, TO, WRITE, RESULT
  bar: "bg-[#323237]",                  // the bar behind the buttons
  dropdown: "bg-[#3a3a40] text-gray-200", // language dropdowns
  buttonText: "text-gray-200",          // text on the "Save" button
  dot: "bg-gray-500",                   // status dot when nothing has happened yet
};

// This creates our own editor theme. It starts from the normal dark theme
// and only changes the colors we list, so the editor matches the page.
const defineMyTheme = (monaco) => {
  monaco.editor.defineTheme("my-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#2b2b2f",              // same color as THEME.page
      "editorGutter.background": "#2b2b2f",        // the strip with line numbers
      "editorLineNumber.foreground": "#7a7a80",    // line numbers
      "editor.lineHighlightBackground": "#34343a", // highlighted current line
    },
  });
};

// Dropdown options: [id the editor understands, name the user sees]
const LANGUAGES = [
  ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["python", "Python"],
  ["java", "Java"], ["csharp", "C#"], ["cpp", "C++"],
  ["go", "Go"], ["php", "PHP"], ["ruby", "Ruby"]
];

// The editor says "csharp" and "cpp", but your backend expects "c#" and "c++".
const API_NAMES = { csharp: "c#", cpp: "c++" };
const toApiName = (id) => API_NAMES[id] || id;

// Options shared by both code editors
const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  automaticLayout: true,
  padding: { top: 16 },
};

// Starter code shown in the editor
const DEFAULT_CODE = `
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

// Tailwind classes shared by the three buttons (so we don't repeat them)
const BUTTON = "rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60";

/* ============================================================
   2. SMALL REUSABLE PIECE: one language dropdown (used for FROM and TO)
   ============================================================ */

function LanguageSelect({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs tracking-widest ${THEME.label}`}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm outline-none ${THEME.border} ${THEME.dropdown}`}
      >
        {LANGUAGES.map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   3. THE MAIN PAGE
   ============================================================ */

export default function JSXRenderer() {
  // ---------- State (the data this page remembers) ----------
  const [code, setCode] = useState(DEFAULT_CODE);   // text inside the editor
  const [Component, setComponent] = useState(null); // the component made from your code
  const [error, setError] = useState(null);         // null, or { title, message }
  const [fromLang, setFromLang] = useState("javascript");
  const [toLang, setToLang] = useState("typescript");
  const [converted, setConverted] = useState(null); // null, or { code, lang }
  const [converting, setConverting] = useState(false); // true while waiting for the backend
  const [saving, setSaving] = useState(false);         // true while saving

  // ---------- Action 1: Run the JSX and show it ----------
  const renderCode = () => {
  try {
    setError(null);
    setConverted(null);

    const js = Babel.transform(code, {
      presets: [["react", { runtime: "classic" }]],
      plugins: ["transform-modules-commonjs"],
    }).code;

    const fakeRequire = (name) => {
      if (name === "react") return React;
      throw new Error(`Cannot import "${name}". Only "react" is available here.`);
    };

    const run = new Function(
      "React",
      "require",
      `const exports = {}; let result = null; const render = (el) => { result = el; }; ${js}\nreturn result;`
    );
    const element = run(React, fakeRequire);

    if (!element) throw new Error("Your code must call render(<YourComponent />)");
    setComponent(() => () => element);
  } catch (err) {
    setError({ title: "Didn't compile", message: err.message });
    setComponent(null);
  }
};

  // ---------- Action 2: Convert the code to another language ----------
  const convertCode = async () => {
    if (!code.trim()) {
      return setError({ title: "Can't convert", message: "Write some code first." });
    }
    if (fromLang === toLang) {
      return setError({ title: "Can't convert", message: "Pick two different languages." });
    }

    setConverting(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/gemini/convert`, {
        code,
        fromLanguage: toApiName(fromLang),
        toLanguage: toApiName(toLang),
      });
      // The backend replies with { convertedCode: "..." }
      setConverted({ code: res.data.convertedCode, lang: toLang });
    } catch (err) {
      console.log(err);
      setError({ title: "Conversion failed", message: err.response?.data?.message || err.message });
      setConverted(null);
    } finally {
      setConverting(false); // always turn "Converting…" off, success or fail
    }
  };

  // ---------- Action 3: Copy the converted code ----------
  const copyConverted = async () => {
    try {
      await navigator.clipboard.writeText(converted.code);
      alert("Copied!");
    } catch {
      alert("Could not copy");
    }
  };

  // ---------- Action 4: Save the component to the backend ----------
  const saveComponent = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?._id || user?.id;
      if (!userId) {
        alert("Please log in first");
        return;
      }

      await axios.post(`${API_URL}/component/add`, { code, user: userId });
      alert("Component saved successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to save component");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Status text + dot color shown at the top right ----------
  let statusText = "Not run yet";
  let statusColor = THEME.dot;
  if (error) { statusText = "Error"; statusColor = "bg-[#e8836b]"; }
  else if (converting) { statusText = "Converting…"; }
  else if (converted) { statusText = "Converted"; statusColor = "bg-emerald-500"; }
  else if (Component) { statusText = "Rendered"; statusColor = "bg-emerald-500"; }

  // ---------- What to show in the right (RESULT) panel ----------
  // Checked from top to bottom: the first one that is true wins.
  const renderResult = () => {
    // 1) An error happened (dark red card)
    if (error) {
      return (
        <div className="rounded-lg border border-[#b3462f] bg-[#3a2622] p-4">
          <div className="mb-2 text-xs font-semibold text-[#e8836b]">{error.title}</div>
          <pre className="whitespace-pre-wrap text-sm text-[#f0b8a8]">{error.message}</pre>
        </div>
      );
    }

    // 2) Code was converted: show it in a read-only editor
    if (converted) {
      const langName = LANGUAGES.find(([id]) => id === converted.lang)?.[1] || converted.lang;
      return (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs tracking-widest ${THEME.label}`}>
              CONVERTED TO {langName.toUpperCase()}
            </span>
            <button
              onClick={copyConverted}
              className="rounded-md border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-600/20"
            >
              Copy
            </button>
          </div>
          <div className={`h-[calc(100%-40px)] min-h-[300px] overflow-hidden rounded-lg border ${THEME.border}`}>
            <Editor
              height="100%"
              language={converted.lang}
              theme={THEME.editor}
              beforeMount={defineMyTheme}
              value={converted.code}
              options={{ ...EDITOR_OPTIONS, readOnly: true }}
            />
          </div>
        </>
      );
    }

    // 3) JSX was run: show the live component.
    // The white card keeps the user's component looking right on a dark page.
    if (Component) {
      return (
        <div className="rounded-lg bg-white p-6">
          <Component />
        </div>
      );
    }

    // 4) Nothing yet: show a hint
    return (
      <div className="flex h-full items-center justify-center text-center">
        <p className="max-w-xs text-sm leading-relaxed text-gray-400">
          Nothing here yet — write some code, then hit{" "}
          <strong className="text-gray-200">Run JSX</strong> to preview it or{" "}
          <strong className="text-gray-200">Convert</strong> to change its language.
        </p>
      </div>
    );
  };

  /* ============================================================
     4. THE LAYOUT (what you see on screen)
     ============================================================ */
  return (
    // pt-20 leaves room for the fixed navbar.
    <div className={`flex min-h-dvh flex-col pt-20 md:h-dvh md:overflow-hidden ${THEME.page}`}>

      {/* TOP BAR: FROM ⇄ TO on the left, status on the right */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${THEME.border}`}>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelect label="FROM" value={fromLang} onChange={setFromLang} />

          {/* Swap button: switches the FROM and TO languages */}
          <button
            onClick={() => { setFromLang(toLang); setToLang(fromLang); }}
            title="Swap languages"
            className={`rounded-md border px-2.5 py-1 text-emerald-400 transition hover:bg-white/10 ${THEME.border}`}
          >
            ⇄
          </button>

          <LanguageSelect label="TO" value={toLang} onChange={setToLang} />
        </div>

        <div className={`flex items-center gap-2 text-xs ${THEME.label}`}>
          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
          {statusText}
        </div>
      </div>

      {/* BODY: two columns on desktop, stacked on phones */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">

        {/* LEFT: the code editor + buttons */}
        <section className={`flex min-h-0 flex-col border-b md:border-b-0 md:border-r ${THEME.border}`}>
          <div className={`px-5 py-2.5 text-xs tracking-widest ${THEME.label}`}>WRITE</div>

          <div className={`h-[55vh] min-h-[280px] border-y md:h-auto md:flex-1 ${THEME.border}`}>
            <Editor
              height="100%"
              language={fromLang}
              theme={THEME.editor}
              beforeMount={defineMyTheme}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={EDITOR_OPTIONS}
            />
          </div>

          <div className={`flex flex-wrap gap-2.5 px-5 py-3.5 ${THEME.bar}`}>
            <button
              onClick={renderCode}
              className={`${BUTTON} border border-emerald-600 text-emerald-400 hover:bg-emerald-600/20`}
            >
              ▶ Run JSX
            </button>
            <button
              onClick={convertCode}
              disabled={converting}
              className={`${BUTTON} border border-emerald-600 text-emerald-400 hover:bg-emerald-600/20`}
            >
              {converting ? "Converting…" : "⇄ Convert"}
            </button>

            <button
              onClick={saveComponent}
              disabled={saving}
              className={`${BUTTON} border hover:bg-white/10 ${THEME.border} ${THEME.buttonText}`}
            >
              {saving ? "Saving…" : "Save Component"}
            </button>
          </div>
        </section>

        {/* RIGHT: the result */}
        <section className={`flex min-h-0 flex-col ${THEME.result}`}>
          <div className={`px-5 py-2.5 text-xs tracking-widest ${THEME.label}`}>RESULT</div>
          <div className="min-h-[300px] flex-1 overflow-auto p-4 md:p-7">
            {renderResult()}
          </div>
        </section>
      </div>
    </div>
  );
}