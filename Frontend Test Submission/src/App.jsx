import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setShortLink("");
    if (!url) {
      setError("URL is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          validity: validity ? Number(validity) : undefined,
          shortcode: shortcode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortLink(data.shortLink);

        // Clear input boxes after successful generation
        setUrl("");
        setValidity("");
        setShortcode("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleCopy = () => {
    if (shortLink) navigator.clipboard.writeText(shortLink);
  };

  return (
    <div className="container">
      <h1 className="title">URL Shortener</h1>
      <input
        className="input"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <input
        className="input"
        placeholder="Validity in minutes (optional)"
        type="number"
        value={validity}
        onChange={(e) => setValidity(e.target.value)}
      />
      <input
        className="input"
        placeholder="Custom shortcode (optional)"
        value={shortcode}
        onChange={(e) => setShortcode(e.target.value)}
      />
      <button className="generate-btn" onClick={handleGenerate}>
        Generate
      </button>
      {shortLink && (
        <div className="result">
          <span>{shortLink}</span>
          <button className="copy-btn" onClick={handleCopy}>
            Copy
          </button>
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
