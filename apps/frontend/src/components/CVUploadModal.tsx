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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Upload CV</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {error}
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-400 bg-blue-900 bg-opacity-20"
              : "border-gray-600 bg-gray-900"
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
                <p className="text-green-400 font-semibold">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 font-semibold">
                  Drag and drop your CV here
                </p>
                <p className="text-gray-400 text-sm">or click to select</p>
                <p className="text-gray-500 text-xs mt-2">
                  Supported: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
