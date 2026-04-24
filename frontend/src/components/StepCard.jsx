import { motion } from 'framer-motion';
import { InteractiveRenderer } from './InteractiveRenderer.jsx';

export function StepCard({ step, index }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Step {index + 1}</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{step.heading}</h3>
        </div>
        <span className="rounded-full bg-surfaceMuted px-3 py-1 text-xs font-medium text-gray-600">
          {step.interactionType || 'text'}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{step.description}</p>
      <InteractiveRenderer step={step} />
    </motion.article>
  );
}
