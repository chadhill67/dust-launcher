"use client";
import { FolderPlus, Download, HardDrive } from "lucide-react";

type EmptyStateProps = {
  onImport?: () => void;
  onDownload?: () => void;
};

export function EmptyState({ onImport, onDownload }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 420,
        padding: 32,
        textAlign: "center",
      }}
    >
      <div
        style={{
          marginBottom: 24,
          width: 80,
          height: 80,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
        }}
      >
        <HardDrive size={32} />
      </div>
      <h3
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "var(--text-strong)",
          letterSpacing: "-0.02em",
        }}
      >
        No builds in library
      </h3>
      <p
        style={{
          marginTop: 12,
          maxWidth: 400,
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--text-muted)",
        }}
      >
        Get started by importing an existing Fortnite installation, or download
        a supported build directly through the launcher.
      </p>
      <div
        style={{
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 320,
        }}
      >
        {onDownload && (
          <button
            onClick={onDownload}
            className="primary-button"
            style={{
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Download size={18} />
            Download Fortnite 10.40
          </button>
        )}
        {onImport && (
          <button
            onClick={onImport}
            className="secondary-button"
            style={{
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <FolderPlus size={18} />
            Import Existing Build
          </button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;