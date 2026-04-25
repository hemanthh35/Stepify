import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { StepCard } from '../components/StepCard.jsx';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      const msg = err?.response?.data?.error || 'Generation failed. Please try again in a moment.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  const openHistoryItem = useCallback(async (id) => {
    setError('');
    setGenerating(true);
    try {
      const res = await api.get(`/api/history/${id}`);
      setExplanation(res.data.data);
      setTopic(res.data.input_prompt || '');
      navigate('/dashboard', { replace: true, state: null });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not load this history item.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.historyId) {
      openHistoryItem(location.state.historyId);
    }
  }, [location.state, openHistoryItem]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <section>
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ask for a topic. Stepify returns a short, interactive sequence you can read at your own pace. History is
            available in its own dedicated page.
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
    </main>
  );
}
