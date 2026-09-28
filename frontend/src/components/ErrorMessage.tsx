import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff, Terminal } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Unable to connect to Well-Nex Digital Twin services.',
  onRetry,
}) => {
  return (
    <div className="bg-alert-pale border border-alert-red/30 rounded-xl p-6 text-center max-w-xl mx-auto my-8 shadow-soft">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-alert-red/20 shadow-sm text-alert-red">
        <ServerOff className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-display font-semibold text-alert-dark mb-1">
        Backend Service Offline or Unreachable
      </h3>

      <p className="text-sm text-alert-dark/90 mb-4 font-medium">
        {message}
      </p>

      <div className="bg-white/90 rounded-lg p-3 text-left border border-alert-red/20 mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-petroleum-navy mb-1.5">
          <Terminal className="w-3.5 h-3.5 text-petroleum-light" />
          <span>Troubleshooting: Start FastAPI Service</span>
        </div>
        <p className="text-xs text-petroleum-light font-mono bg-desert-beige p-2 rounded border border-sand-warm/40 select-all">
          cd Well-Nex/backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-petroleum-navy text-sand-warm text-sm font-medium rounded-lg hover:bg-petroleum-dark transition-colors shadow-soft"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
