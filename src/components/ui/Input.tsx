import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 bg-miboCardBg border rounded-lg text-slate-100 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-miboTeal focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed transition-all
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-500 focus:ring-red-500" : "border-white/10"}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
