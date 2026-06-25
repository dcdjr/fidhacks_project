import { useState } from "react";
import "./App.css";

type AnalysisResult = {
  micro_win_title: string;
  short_summary: string;
  skills_learned: string[];
  next_step: string;
};

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) throw new Error("The analysis request failed.");

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch {
      setError("Could not reach the backend. Make sure FastAPI is running.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header>
        <p className="eyebrow">FidHacks 2026</p>
        <h1>Micro-Win Tracker</h1>
        <p className="intro">
          Capture something small you learned, solved, or accomplished today.
        </p>
      </header>

      <form className="entry-card" onSubmit={handleAnalyze}>
        <label htmlFor="micro-win">What was your micro-win?</label>
        <textarea
          id="micro-win"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Example: I finally figured out why my API request was failing..."
          rows={6}
        />
        <button type="submit" disabled={!text.trim() || isLoading}>
          {isLoading ? "Analyzing..." : "Analyze my win"}
        </button>
      </form>

      <section className="analysis-card" aria-live="polite">
        <p className="card-label">AI Analysis</p>

        {!result && !error && (
          <p className="empty-state">
            Your analysis will appear here after you submit a micro-win.
          </p>
        )}

        {error && <p className="error-message">{error}</p>}

        {result && (
          <div className="analysis-content">
            <h2>{result.micro_win_title}</h2>
            <div>
              <h3>Short summary</h3>
              <p>{result.short_summary}</p>
            </div>
            <div>
              <h3>Skills learned</h3>
              <ul className="skill-list">
                {result.skills_learned.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Next step</h3>
              <p>{result.next_step}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
