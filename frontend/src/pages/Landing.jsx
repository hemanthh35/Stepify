import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Step-by-step clarity',
    body: 'Break complex topics into short, guided steps you can actually follow.',
  },
  {
    title: 'Interactive learning',
    body: 'Use lightweight interactions to build intuition instead of skimming walls of text.',
  },
  {
    title: 'Your history',
    body: 'Save generations and revisit explanations whenever you need a refresher.',
  },
];

export default function Landing() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold uppercase tracking-wide text-accent"
            >
              Interactive AI learning
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl"
            >
              Learn anything, one calm step at a time.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="mt-6 max-w-xl text-lg text-gray-600"
            >
              Stepify turns your question into a structured walkthrough with gentle motion, simple controls, and a
              layout that stays readable on every screen size.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/signup" className="btn-primary">
                Create an account
              </Link>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-line bg-white p-8 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">Preview</p>
            <p className="mt-3 text-2xl font-semibold text-ink">How does binary search shrink the problem?</p>
            <ul className="mt-6 space-y-4 text-sm text-gray-700">
              <li className="rounded-lg bg-surfaceMuted p-4">1. Start with the full sorted range.</li>
              <li className="rounded-lg bg-surfaceMuted p-4">2. Compare the middle element to your target.</li>
              <li className="rounded-lg bg-surfaceMuted p-4">3. Discard half of the range and repeat.</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card h-full">
              <h2 className="text-base font-semibold text-ink">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
