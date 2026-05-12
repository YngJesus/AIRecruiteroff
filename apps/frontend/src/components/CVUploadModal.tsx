import React, { useState } from "react";
import { candidatesApi } from "../api/candidates";

interface CVUploadModalProps {
  jobId: string;
  onSuccess: (payload: { candidateId: string; status: "queued" }) => void;
  onClose: () => void;
}

export function CVUploadModal({
  jobId,
  onSuccess,
  onClose,
}: CVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (
        !["application/pdf", "image/jpeg", "image/png"].includes(
          selectedFile.type,
        )
      ) {
        setError("Only PDF and images (JPG, PNG) allowed");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large (max 10MB)");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (
        !["application/pdf", "image/jpeg", "image/png"].includes(
          selectedFile.type,
        )
      ) {
        setError("Only PDF and images (JPG, PNG) allowed");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large (max 10MB)");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidatesApi.uploadCV(jobId, file);
      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-8 shadow-2xl shadow-black/50">
        <h2 className="mb-1 text-2xl font-bold text-white">Upload CV</h2>
        <p className="mb-4 text-sm text-slate-400">
          PDF or image — queued for AI parsing and matching.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragActive
              ? "border-blue-400 bg-blue-950/40 ring-1 ring-blue-500/30"
              : "border-slate-600 bg-slate-950/60"
          }`}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            {file ? (
              <div>
                <p className="font-semibold text-emerald-400">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-200">
                  Drag and drop your CV here
                </p>
                <p className="text-sm text-slate-400">or click to select</p>
                <p className="mt-2 text-xs text-slate-500">
                  PDF, JPG, PNG — max 10MB
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40"
          >
            {isLoading ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
