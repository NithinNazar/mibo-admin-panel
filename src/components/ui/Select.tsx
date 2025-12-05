import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 bg-miboCardBg border rounded-lg text-slate-100
            focus:outline-none focus:ring-2 focus:ring-miboTeal focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed transition-all
            ${error ? "border-red-500 focus:ring-red-500" : "border-white/10"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
