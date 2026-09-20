"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TrailerContextType {
  isOpen: boolean;
  openTrailer: () => void;
  closeTrailer: () => void;
}

const TrailerContext = createContext<TrailerContextType | null>(null);

export function TrailerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = {
    isOpen,
    openTrailer: () => setIsOpen(true),
    closeTrailer: () => setIsOpen(false),
  };

  return <TrailerContext.Provider value={value}>{children}</TrailerContext.Provider>;
}

export function useTrailer() {
  const ctx = useContext(TrailerContext);
  if (!ctx) throw new Error("useTrailer must be used within TrailerProvider");
  return ctx;
}