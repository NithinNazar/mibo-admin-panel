import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 bg-miboCardBg border rounded-lg text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-miboTeal focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none
            ${error ? "border-red-500 focus:ring-red-500" : "border-white/10"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
