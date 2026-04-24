import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { StepCard } from '../components/StepCard.jsx';

export default function Dashboard() {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/api/history');
      setHistory(res.data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function onGenerate(e) {
    e.preventDefault();
    setError('');
    if (!topic.trim()) {
      setError('Enter a topic or question to generate a walkthrough.');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/api/generate', { topic: topic.trim() });
      setExplanation(res.data.data);
      setHistoryId(res.data.data.historyId || null);
      await loadHistory();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Generation failed. Please try again in a moment.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function openHistoryItem(id) {
    setError('');
    setExplanation(null);
    setGenerating(true);
    try {
      const res = await api.get(`/api/history/${id}`);
      setExplanation(res.data.data);
      setHistoryId(res.data.id);
      setTopic(res.data.input_prompt || '');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not load this history item.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <h2 className="text-sm font-semibold text-ink">History</h2>
            <p className="mt-1 text-xs text-gray-500">Reopen a past explanation anytime.</p>
            {loadingList ? (
              <p className="mt-4 text-sm text-gray-500">Loading</p>
            ) : history.length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">No saved items yet. Generate your first walkthrough.</p>
            ) : (
              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openHistoryItem(item.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        historyId === item.id
                          ? 'border-accent bg-violet-50 text-ink'
                          : 'border-line bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="line-clamp-2">{item.input_prompt}</span>
                      <span className="mt-1 block text-xs text-gray-400">{item.created_at}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section>
          <header className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ask for a topic. Stepify returns a short, interactive sequence you can read at your own pace.
            </p>
          </header>

          <form onSubmit={onGenerate} className="mt-8 max-w-3xl space-y-3">
            <label className="block text-sm font-medium text-ink" htmlFor="topic">
              Topic or question
            </label>
            <textarea
              id="topic"
              name="topic"
              rows={3}
              className="input"
              placeholder="Example: Explain how gradient descent finds a minimum."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={generating}>
                {generating ? 'Generating' : 'Generate walkthrough'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setExplanation(null);
                  setHistoryId(null);
                  setTopic('');
                  setError('');
                }}
              >
                Clear
              </button>
            </div>
          </form>

          {generating && !explanation ? <LoadingSpinner label="Generating your steps" /> : null}

          <AnimatePresence mode="wait">
            {explanation ? (
              <motion.div
                key={explanation.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-10 space-y-6"
              >
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Result</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">{explanation.title}</h2>
                  {explanation.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">{explanation.description}</p>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  {explanation.steps?.map((step, index) => (
                    <StepCard key={`${step.id}-${index}`} step={step} index={index} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
