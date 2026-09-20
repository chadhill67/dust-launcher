"use client";

import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

interface ToggleOptionProps {
  label: string;
  description?: string;
  value?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleOption({
  label,
  description,
  value,
  defaultChecked = false,
  onChange,
}: ToggleOptionProps) {
  const colors = useTheme();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const checked = value ?? internalChecked;

  function handleToggle() {
    const next = !checked;
    setInternalChecked(next);
    onChange?.(next);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${colors.current.text.primary}`}>
          {label}
        </p>
        {description && (
          <p className={`mt-0.5 text-xs ${colors.current.text.secondary}`}>
            {description}
          </p>
        )}
      </div>

      <button
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors duration-300
          ${checked ? "bg-green-500 hover:bg-green-600" : colors.current.background.secondary}
          border ${colors.current.border} shadow-inner

        `}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 translate-y-px rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-0.5"}
          `}
        />
      </button>
    </div>
  );
}
