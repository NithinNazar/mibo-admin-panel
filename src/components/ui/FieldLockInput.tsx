import React from "react";

interface FieldLockInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: "text" | "number" | "email" | "tel";
  required?: boolean;
  locked?: boolean;
  onLockToggle?: () => void;
  placeholder?: string;
  error?: string;
}

export const FieldLockInput: React.FC<FieldLockInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  locked = false,
  onLockToggle,
  placeholder,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input with Lock/Unlock Button */}
      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          disabled={locked}
          placeholder={placeholder}
          className={`
            flex-1 px-3 py-2 border rounded-md text-sm transition-colors
            ${
              locked
                ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300"
                : "bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            }
            ${error ? "border-red-500" : ""}
          `}
        />

        {onLockToggle && (
          <button
            type="button"
            onClick={onLockToggle}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
              ${
                locked
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {locked ? (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add
              </span>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Locked Indicator */}
      {locked && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Field locked
        </p>
      )}
    </div>
  );
};
