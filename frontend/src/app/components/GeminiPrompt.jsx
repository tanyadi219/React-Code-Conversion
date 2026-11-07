"use client";

import axios from "axios";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

export default function GeminiPrompt() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateWithGemini = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/gemini/generate`, { prompt });
      setResult(res.data.text);
    } catch (err) {
      console.log(err);
      setError("Failed to get a response from Gemini");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask Gemini something..."
        rows={4}
        style={{ width: "100%" }}
      />
      <button onClick={generateWithGemini} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>}
    </div>
  );
}