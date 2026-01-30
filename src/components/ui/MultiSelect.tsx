import React, { useState } from "react";
import { X, Plus } from "lucide-react";

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select an option",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option),
  );

  const handleAdd = (value: string) => {
    if (!selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
    setIsOpen(false);
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Selected Items */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map((value) => (
            <div
              key={value}
              className="flex items-center gap-2 px-3 py-1.5 bg-miboTeal/20 border border-miboTeal/30 rounded-lg text-sm text-white"
            >
              <span>{value}</span>
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button / Dropdown */}
      {availableOptions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:border-miboTeal/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              {placeholder}
            </span>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Options */}
              <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {availableOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAdd(option)}
                    className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-miboTeal/20 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectedValues.length === 0 && (
        <p className="text-xs text-slate-400">
          No {label.toLowerCase()} selected. Click the button above to add.
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
