import React from 'react';
import { Plus, Minus } from 'lucide-react';

export function DiffView({ diff = [] }) {
  if (!diff || !Array.isArray(diff) || diff.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded">
        No line-level changes recorded.
      </div>
    );
  }

  return (
    <div className="font-mono text-xs rounded-lg border border-slate-200 overflow-hidden bg-slate-900 text-slate-100">
      <div className="bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 flex justify-between border-b border-slate-700">
        <span>Official Source Text Diff</span>
        <span>Green = Added • Red = Removed</span>
      </div>
      <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
        {diff.map((item, idx) => {
          const isAdd = item.type === 'add';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2 px-3 py-1.5 ${
                isAdd ? 'bg-emerald-950/60 text-emerald-300' : 'bg-rose-950/60 text-rose-300'
              }`}
            >
              <span className="shrink-0 font-bold mt-0.5">
                {isAdd ? <Plus className="w-3.5 h-3.5 text-emerald-400" /> : <Minus className="w-3.5 h-3.5 text-rose-400" />}
              </span>
              <span className="whitespace-pre-wrap break-all leading-relaxed">
                {item.line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

