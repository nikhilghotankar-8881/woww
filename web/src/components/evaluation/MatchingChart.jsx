import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function MatchingChart({ run = {} }) {
  const metrics = run.metrics || {};
  const perScheme = metrics.perScheme || {};

  const data = Object.keys(perScheme).map(schemeId => ({
    name: schemeId.toUpperCase(),
    fidelity: Math.round(perScheme[schemeId] * 100)
  }));

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Matching Rule Fidelity (E4)</h4>
          <span className="text-xs text-slate-500">Agreement against PRD decision tables (n = {run.n || 0} checks)</span>
        </div>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
          Overall: {Math.round((metrics.agreementRate || 1) * 100)}%
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(val) => [`${val}% Agreement`, 'Fidelity']} />
            <Bar dataKey="fidelity" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 text-center">
        Tested on synthetic edge-case profiles covering owners, tenants, landless, and loanees.
      </p>
    </div>
  );
}

