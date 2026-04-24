import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts';

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function buildPlotData(content) {
  const rawX = Array.isArray(content.x) ? content.x : [];
  const rawY = Array.isArray(content.y) ? content.y : [];
  const len = Math.min(rawX.length, rawY.length);
  if (len < 2) {
    return null;
  }
  const rows = [];
  for (let i = 0; i < len; i += 1) {
    const x = Number(rawX[i]);
    const y = Number(rawY[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      rows.push({ x, y });
    }
  }
  return rows.length >= 2 ? rows : null;
}

function toEditableRows(data) {
  return data.map((d, index) => ({
    id: `${index}-${d.x}-${d.y}`,
    x: String(d.x),
    y: String(d.y),
  }));
}

function toNumericRows(rows) {
  const parsed = rows
    .map((row) => ({ x: Number(row.x), y: Number(row.y) }))
    .filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y));
  return parsed.length >= 2 ? parsed : null;
}

function calculateTrendline(points) {
  if (!points || points.length < 2) {
    return null;
  }
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i += 1) {
    const { x, y } = points[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return null;
  }
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const sorted = [...points].sort((a, b) => a.x - b.x);
  const minX = sorted[0].x;
  const maxX = sorted[sorted.length - 1].x;
  return {
    slope,
    intercept,
    lineData: [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ],
  };
}

export function InteractiveRenderer({ step }) {
  const type = step.interactionType || 'text';
  const content = step.content && typeof step.content === 'object' ? step.content : {};
  const basePlotData = useMemo(() => {
    const x = Array.isArray(content.x) ? content.x : [];
    const y = Array.isArray(content.y) ? content.y : [];
    return buildPlotData({ x, y });
  }, [content.x, content.y]);

  const [demoResult, setDemoResult] = useState(null);
  const sliderMin = Number.isFinite(Number(content.sliderMin)) ? Number(content.sliderMin) : 0;
  const sliderMax = Number.isFinite(Number(content.sliderMax)) ? Number(content.sliderMax) : 100;
  const initialSlider = clamp(50, sliderMin, sliderMax);
  const [sliderValue, setSliderValue] = useState(initialSlider);
  const [editableRows, setEditableRows] = useState(basePlotData ? toEditableRows(basePlotData) : []);

  useEffect(() => {
    if (basePlotData) {
      setEditableRows(toEditableRows(basePlotData));
    } else {
      setEditableRows([]);
    }
  }, [basePlotData]);

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

  if (type === 'plot') {
    const plotType = ['line', 'bar', 'scatter'].includes(content.plotType) ? content.plotType : 'line';
    const xLabel = content.xLabel || 'X';
    const yLabel = content.yLabel || 'Y';
    const data = toNumericRows(editableRows);
    const showRegression = plotType !== 'bar';
    const trend = showRegression ? calculateTrendline(data) : null;

    if (!basePlotData) {
      return (
        <div className="mt-4 rounded-lg border border-line bg-surfaceMuted p-4 text-sm text-gray-800">
          Plot data is missing or invalid for this step.
        </div>
      );
    }

    const updateRow = (id, key, value) => {
      setEditableRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    };

    const addPoint = () => {
      setEditableRows((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, x: '0', y: '0' }]);
    };

    const removePoint = (id) => {
      setEditableRows((prev) => (prev.length <= 2 ? prev : prev.filter((row) => row.id !== id)));
    };

    return (
      <div className="mt-4 rounded-lg border border-line bg-white p-4">
        {content.plotTitle ? <p className="mb-3 text-sm font-medium text-ink">{content.plotTitle}</p> : null}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {plotType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: xLabel, position: 'insideBottom', offset: -4 }} />
                <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="y" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : null}
            {plotType === 'scatter' ? (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -4 }} />
                <YAxis type="number" dataKey="y" name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={data} fill="#7C3AED" />
                {trend ? <Line data={trend.lineData} dataKey="y" stroke="#059669" strokeWidth={2} dot={false} legendType="none" /> : null}
              </ScatterChart>
            ) : null}
            {plotType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: xLabel, position: 'insideBottom', offset: -4 }} />
                <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#7C3AED" strokeWidth={2} dot={false} />
                {trend ? <Line data={trend.lineData} dataKey="y" stroke="#059669" strokeWidth={2} dot={false} /> : null}
              </LineChart>
            ) : null}
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-lg border border-line bg-surfaceMuted p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Edit data points</p>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={addPoint}>
              Add point
            </button>
          </div>
          <div className="space-y-2">
            {editableRows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-[1fr,1fr,auto] items-center gap-2">
                <input
                  type="number"
                  value={row.x}
                  onChange={(e) => updateRow(row.id, 'x', e.target.value)}
                  className="input py-2 text-xs"
                  aria-label={`${xLabel} value ${index + 1}`}
                />
                <input
                  type="number"
                  value={row.y}
                  onChange={(e) => updateRow(row.id, 'y', e.target.value)}
                  className="input py-2 text-xs"
                  aria-label={`${yLabel} value ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removePoint(row.id)}
                  className="btn-secondary px-2 py-1.5 text-xs"
                  disabled={editableRows.length <= 2}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {!data ? <p className="mt-2 text-xs text-red-600">Enter at least two valid numeric points.</p> : null}
          {trend ? (
            <p className="mt-2 text-xs text-gray-700">
              Trendline (linear regression): y = {trend.slope.toFixed(3)}x + {trend.intercept.toFixed(3)}
            </p>
          ) : null}
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
