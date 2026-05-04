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
      ? "bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
      : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="p-5">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="p-5 pt-0 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 text-white font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded text-white font-semibold ${confirmClasses}`}
          >
            {isLoading ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

