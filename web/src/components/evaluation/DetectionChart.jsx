import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function DetectionChart({ run = {} }) {
  const metrics = run.metrics || {};

  const data = [
    {
      name: run.synthetic ? 'Synthetic Edits' : 'Live Captures',
      TP: metrics.tp || 0,
      FP: metrics.fp || 0,
      FN: metrics.fn || 0,
      TN: metrics.tn || 0,
    }
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Change Detection Classification (E2)</h4>
          <span className="text-xs text-slate-500">Materiality classification on snapshot replay (n = {run.n || 0})</span>
        </div>
        <div className="flex space-x-2">
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
            Precision: {Math.round((metrics.precision || 1) * 100)}%
          </span>
          <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
            Recall: {Math.round((metrics.recall || 1) * 100)}%
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="TP" name="True Positive (Found real change)" fill="#16a34a" stackId="a" />
            <Bar dataKey="TN" name="True Negative (Ignored cosmetic change)" fill="#0ea5e9" stackId="a" />
            <Bar dataKey="FP" name="False Positive (Spam alert risk)" fill="#f59e0b" stackId="a" />
            <Bar dataKey="FN" name="False Negative (Missed deadline risk)" fill="#e11d48" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">F1 Score</span>
          <span className="font-bold text-slate-800 text-sm">{((metrics.f1 || 1) * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Corpus Type</span>
          <span className="font-bold text-slate-800 text-sm">{run.synthetic ? 'Synthetic Replay' : 'Live Archive'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Sample Size</span>
          <span className="font-bold text-slate-800 text-sm">n = {run.n || 0}</span>
        </div>
      </div>
    </div>
  );
}

