import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function Home() {
  const [urls, setUrls] = useState([{ url: "", validity: "", shortcode: "", shortLink: "", error: "" }]);
  const [history, setHistory] = useState([]);

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleGenerate = async (index) => {
    const current = urls[index];
    if (!current.url) {
      handleChange(index, "error", "URL is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: current.url,
          validity: current.validity ? Number(current.validity) : undefined,
          shortcode: current.shortcode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        handleChange(index, "shortLink", data.shortLink);
        handleChange(index, "error", "");

        setHistory((prev) => [
          ...prev,
          { original: current.url, shortLink: data.shortLink, expiry: data.expiry || "N/A" },
        ]);

        handleChange(index, "url", "");
        handleChange(index, "validity", "");
        handleChange(index, "shortcode", "");
      } else {
        handleChange(index, "error", data.error || "Something went wrong");
      }
    } catch {
      handleChange(index, "error", "Server error");
    }
  };

  const handleAddField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: "", validity: "", shortcode: "", shortLink: "", error: "" }]);
    }
  };

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  return (
    <div className="container">
      <h1 className="title">URL Shortener</h1>
      {urls.map((item, index) => (
        <div key={index} className="url-block">
          <input
            className="input"
            placeholder="Enter URL"
            value={item.url}
            onChange={(e) => handleChange(index, "url", e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Validity in minutes (optional)"
            value={item.validity}
            onChange={(e) => handleChange(index, "validity", e.target.value)}
          />
          <input
            className="input"
            placeholder="Custom shortcode (optional)"
            value={item.shortcode}
            onChange={(e) => handleChange(index, "shortcode", e.target.value)}
          />
          <button className="generate-btn" onClick={() => handleGenerate(index)}>
            Generate
          </button>
          {item.shortLink && (
            <div className="result">
              <span>{item.shortLink}</span>
              <button className="copy-btn" onClick={() => handleCopy(item.shortLink)}>
                Copy
              </button>
            </div>
          )}
          {item.error && <div className="error">{item.error}</div>}
        </div>
      ))}

      {urls.length < 5 && (
        <button className="add-btn" onClick={handleAddField}>
          Add Another URL
        </button>
      )}

      <Link to="/history" state={{ history }}>
        <button className="history-btn">View Shortened URL History</button>
      </Link>
    </div>
  );
}

export default Home;
