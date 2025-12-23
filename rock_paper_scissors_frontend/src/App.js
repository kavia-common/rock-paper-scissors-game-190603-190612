import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Game frontend for Rock Paper Scissors.
 * - Centered game panel
 * - Buttons for Rock, Paper, Scissors
 * - Calls backend POST /play with body { user_choice: 'rock'|'paper'|'scissors' }
 * - Shows loading while waiting
 * - Displays both choices and result
 * - "Play Again" resets state
 * - Light theme with blue/cyan accents
 */

// Helpers
const DEFAULT_API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
const CHOICES = ['rock', 'paper', 'scissors'];

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the API base URL. Default is http://localhost:3001. */
  const hardcoded = DEFAULT_API_BASE;
  // Simple override hook for future env injection:
  // If window.__RPS_API_BASE__ is set elsewhere, it will be used.
  const injected = typeof window !== 'undefined' ? window.__RPS_API_BASE__ : undefined;
  return injected || hardcoded;
}

// PUBLIC_INTERFACE
function App() {
  /** Rock Paper Scissors game UI component. */
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  // PUBLIC_INTERFACE
  const play = async (choice) => {
    /**
     * Sends the user's choice to backend and updates UI with result.
     * choice: 'rock' | 'paper' | 'scissors'
     */
    setError(null);
    setLoading(true);
    setResult(null);
    setUserChoice(choice);
    setComputerChoice(null);

    try {
      const res = await fetch(`${apiBase}/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_choice: choice }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API error ${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();
      // Expecting { user_choice, computer_choice, result }
      setComputerChoice(data.computer_choice ?? null);
      setResult(data.result ?? null);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const reset = () => {
    /** Resets game state for a new round. */
    setLoading(false);
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App" style={styles.app}>
      <header className="App-header" style={styles.header}>
        <div style={styles.panel} role="region" aria-label="Rock Paper Scissors game panel">
          <h1 style={styles.title}>Rock Paper Scissors</h1>
          <p style={styles.subtitle}>Choose your move to play against the computer</p>

          <div style={styles.buttonsRow} aria-label="Choice buttons">
            {CHOICES.map((c) => (
              <button
                key={c}
                onClick={() => play(c)}
                disabled={loading || !!result}
                style={{
                  ...styles.choiceBtn,
                  ...(loading || result ? styles.disabledBtn : {}),
                }}
                aria-disabled={loading || !!result}
                aria-label={`Choose ${c}`}
              >
                {iconForChoice(c)} {capitalize(c)}
              </button>
            ))}
          </div>

          <div style={styles.statusArea} aria-live="polite">
            {loading && (
              <div style={styles.loadingRow}>
                <div style={styles.spinner} aria-hidden="true" />
                <span style={styles.loadingText}>Playing...</span>
              </div>
            )}

            {error && (
              <div style={styles.errorBox} role="alert">
                {error}
              </div>
            )}

            {!loading && (userChoice || computerChoice || result) && (
              <div style={styles.resultsBox}>
                <div style={styles.resultsRow}>
                  <div style={styles.resultCard}>
                    <div style={styles.resultLabel}>You</div>
                    <div style={styles.resultChoice}>
                      {userChoice ? iconForChoice(userChoice) : '—'} {userChoice ? capitalize(userChoice) : ''}
                    </div>
                  </div>
                  <div style={styles.resultCard}>
                    <div style={styles.resultLabel}>Computer</div>
                    <div style={styles.resultChoice}>
                      {computerChoice ? iconForChoice(computerChoice) : '—'} {computerChoice ? capitalize(computerChoice) : ''}
                    </div>
                  </div>
                </div>
                {result && (
                  <div style={{ ...styles.resultText, ...resultColor(result) }}>
                    {formatResult(result)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.footerRow}>
            <button
              onClick={reset}
              style={styles.playAgainBtn}
              disabled={loading && !error}
              aria-disabled={loading && !error}
            >
              Play Again
            </button>
          </div>

          <div style={styles.apiNote} title="API base URL">
            API: {apiBase}
          </div>
        </div>
      </header>
    </div>
  );
}

function capitalize(s) {
  return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}

function formatResult(r) {
  const map = { win: 'You Win!', lose: 'You Lose!', draw: 'Draw!' };
  return map[r] || String(r || '');
}

function resultColor(r) {
  // Style guide primary: #3b82f6 (blue), success: #06b6d4 (cyan), error: #EF4444
  if (r === 'win') return { color: '#06b6d4' };
  if (r === 'lose') return { color: '#EF4444' };
  return { color: '#3b82f6' };
}

function iconForChoice(c) {
  if (c === 'rock') return '🪨';
  if (c === 'paper') return '📄';
  if (c === 'scissors') return '✂️';
  return '';
}

// Inline styles to match light theme with blue/cyan accents
const styles = {
  app: {
    background: '#f9fafb',
    minHeight: '100vh',
    color: '#111827',
  },
  header: {
    background: 'linear-gradient(180deg, rgba(59,130,246,0.06), rgba(243,244,246,1))',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 520,
    background: '#ffffff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  title: {
    margin: '4px 0 0 0',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 0.2,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    margin: '8px 0 20px 0',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  buttonsRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  choiceBtn: {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform .1s ease, box-shadow .2s ease, background .2s ease',
    boxShadow: '0 6px 14px rgba(59,130,246,0.25)',
  },
  disabledBtn: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  statusArea: {
    minHeight: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#3b82f6',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '3px solid rgba(59,130,246,0.2)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontWeight: 600,
  },
  resultsBox: {
    width: '100%',
  },
  resultsRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  resultCard: {
    flex: '1 1 180px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    textAlign: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultChoice: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 800,
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 8,
  },
  playAgainBtn: {
    background: '#06b6d4',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(6,182,212,0.25)',
  },
  apiNote: {
    marginTop: 14,
    fontSize: 11,
    textAlign: 'center',
    color: '#64748b',
  },
};

// Inject keyframes for spinner
const styleEl = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleEl) {
  styleEl.innerHTML = `
    @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
    button:hover:not([disabled]) { transform: translateY(-1px); }
    button:active:not([disabled]) { transform: translateY(0); }
  `;
  document.head.appendChild(styleEl);
}

export default App;
