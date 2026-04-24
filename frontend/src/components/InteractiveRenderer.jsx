import { useState } from 'react';
import { motion } from 'framer-motion';

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function InteractiveRenderer({ step }) {
  const type = step.interactionType || 'text';
  const content = step.content && typeof step.content === 'object' ? step.content : {};

  const [demoResult, setDemoResult] = useState(null);
  const sliderMin = Number.isFinite(Number(content.sliderMin)) ? Number(content.sliderMin) : 0;
  const sliderMax = Number.isFinite(Number(content.sliderMax)) ? Number(content.sliderMax) : 100;
  const initialSlider = clamp(50, sliderMin, sliderMax);
  const [sliderValue, setSliderValue] = useState(initialSlider);

  if (type === 'button_demo') {
    return (
      <div className="mt-4 space-y-3 rounded-lg border border-line bg-surfaceMuted p-4">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDemoResult(content.result || content.mainText || 'Updated.')}
        >
          {content.buttonLabel || 'Try it'}
        </button>
        {demoResult ? (
          <p className="text-sm text-ink" role="status">
            {demoResult}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Tap the button to see a quick demonstration.</p>
        )}
      </div>
    );
  }

  if (type === 'slider') {
    return (
      <div className="mt-4 space-y-3 rounded-lg border border-line bg-surfaceMuted p-4">
        <label className="block text-sm font-medium text-ink" htmlFor={`slider-${step.id}`}>
          Adjust value
        </label>
        <input
          id={`slider-${step.id}`}
          type="range"
          min={sliderMin}
          max={sliderMax}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <p className="text-sm text-gray-700">
          Value: <span className="font-semibold text-ink">{sliderValue}</span>
          {content.mainText ? ` — ${content.mainText}` : ''}
        </p>
      </div>
    );
  }

  if (type === 'animation') {
    return (
      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surfaceMuted p-4">
        <motion.div
          className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-200 to-emerald-100 shadow-inner"
          animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="mt-4 text-sm text-gray-700">
          {content.animationDescription || content.mainText || 'Watch the motion and connect it to the idea above.'}
        </p>
      </div>
    );
  }

  if (type === 'comparison') {
    const leftTitle = content.leftTitle || content.optionA || 'Option A';
    const rightTitle = content.rightTitle || content.optionB || 'Option B';
    const leftBody = content.leftBody || content.leftText || 'First approach or idea.';
    const rightBody = content.rightBody || content.rightText || 'Alternative approach or idea.';
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{leftTitle}</p>
          <p className="mt-2 text-sm text-gray-700">{leftBody}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{rightTitle}</p>
          <p className="mt-2 text-sm text-gray-700">{rightBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-surfaceMuted p-4 text-sm text-gray-800">
      {content.mainText || 'Take a moment to reflect on this step before moving on.'}
    </div>
  );
}
