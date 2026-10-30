import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto my-12">
      <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
      <h1 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-2 mb-6">
        The requested page does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Schemes Directory</span>
      </Link>
    </div>
  );
}

