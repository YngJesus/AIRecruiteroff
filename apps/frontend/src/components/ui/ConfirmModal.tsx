import React, { useEffect } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const confirmClasses =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-500 disabled:bg-slate-600"
      : "bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/50">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-5 pt-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${confirmClasses}`}
          >
            {isLoading ? "Working…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

