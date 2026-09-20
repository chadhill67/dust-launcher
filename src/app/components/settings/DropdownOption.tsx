"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

interface DropdownOptionProps<T extends string | number> {
  label: string;
  description?: string;
  options: { value: T; label: string }[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

export function DropdownOption<T extends string | number>({
  label,
  description,
  options,
  value,
  defaultValue,
  onChange,
}: DropdownOptionProps<T>) {
  const colors = useTheme();
  const [internalValue, setInternalValue] = useState<T>(
    defaultValue ?? options[0]?.value,
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ?? internalValue;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === selected)?.label ?? "";

  function handleSelect(next: T) {
    setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${colors.current.text.primary}`}>{label}</p>
        {description && (
          <p className={`mt-0.5 text-xs ${colors.current.text.secondary}`}>
            {description}
          </p>
        )}
      </div>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border
            ${colors.current.border}
            ${colors.current.background.secondary}
            ${colors.current.text.primary}
          `}
        >
          <span className="capitalize">{selectedLabel}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            className={`absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md p-1 border
              ${colors.current.border}
              ${colors.current.background.secondary}
            `}
          >
            {options.map((option) => {
              const isActive = selected === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm capitalize transition-colors
                    ${
                      isActive
                        ? colors.current.text.primary
                        : colors.current.text.secondary
                    }
                  `}
                >
                  {option.label}
                  {isActive && <Check className="ml-2 h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}