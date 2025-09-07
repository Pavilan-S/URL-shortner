import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function HistoryPage() {
  const location = useLocation();
  const history = location.state?.history || [];

  return (
    <div className="container">
      <h1 className="title">Shortened URL History</h1>
      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Link</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.original}</td>
                <td>{item.shortLink}</td>
                <td>{item.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/">
        <button>Go Back</button>
      </Link>
    </div>
  );
}
