import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/history');
        if (!cancelled) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.error || 'Could not load history right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete(id) {
    if (!window.confirm('Remove this walkthrough from your history? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    setError('');
    try {
      await api.delete(`/api/history/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not delete this item.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">History</h1>
        <p className="mt-2 text-sm text-gray-600">Your previous topics and generated walkthroughs are saved here.</p>
      </header>

      {loading ? <LoadingSpinner label="Loading your history" /> : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && history.length === 0 ? (
        <div className="card text-center">
          <h2 className="text-lg font-semibold text-ink">No history yet</h2>
          <p className="mt-2 text-sm text-gray-600">Generate your first walkthrough from the dashboard.</p>
          <button type="button" className="btn-primary mt-6" onClick={() => navigate('/dashboard')}>
            Go to dashboard
          </button>
        </div>
      ) : null}

      {!loading && history.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {history.map((item) => (
            <article key={item.id} className="card">
              <p className="line-clamp-2 text-base font-semibold text-ink">{item.input_prompt}</p>
              {item.title ? (
                <p className="mt-1 line-clamp-2 text-sm font-medium text-accent">{item.title}</p>
              ) : null}
              <p className="mt-2 text-xs text-gray-500">{item.created_at}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-xs"
                  onClick={() => navigate('/dashboard', { state: { historyId: item.id } })}
                >
                  Open in dashboard
                </button>
                <button
                  type="button"
                  className="border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item.id)}
                >
                  {deletingId === item.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
