import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function ExtractionChart({ run = {} }) {
  const metrics = run.metrics || {};
  const byField = metrics.byField || {};

  const data = Object.keys(byField).map(key => {
    const item = byField[key];
    const pct = item.total > 0 ? (item.matched / item.total) * 100 : 0;
    return {
      field: key.replace(/_/g, ' '),
      accuracy: Math.round(pct),
      total: item.total
    };
  });

  // Overall grounding pass rate
  const groundingPct = Math.round((metrics.groundingPassRate || 1) * 100);
  data.push({
    field: 'Grounding Verification',
    accuracy: groundingPct,
    total: run.n || 0
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Extraction Accuracy & Grounding (E1)</h4>
          <span className="text-xs text-slate-500">Exact match on hand-labelled primary notices (n = {run.n || 0})</span>
        </div>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
          Overall: {Math.round((metrics.accuracy || 0) * 100)}%
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="field" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              formatter={(val, name, props) => [`${val}% (n=${props.payload.total})`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {metrics.interval && (
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          95% Wilson Confidence Interval: [{(metrics.interval[0] * 100).toFixed(1)}%, {(metrics.interval[1] * 100).toFixed(1)}%]
        </p>
      )}
    </div>
  );
}

