import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { questionsApi } from "../../api/questions";

export function TechLeadQuestionsPage() {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ text: "" });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await questionsApi.findAll();
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) return;
      await questionsApi.create(
        formData.text,
        currentUser.id,
        currentUser.departmentId,
      );
      setFormData({ text: "" });
      setShowForm(false);
      const res = await questionsApi.findAll();
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to create question", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await questionsApi.delete(id);
      const res = await questionsApi.findAll();
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Interview Questions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {showForm ? "Cancel" : "Add Question"}
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800 p-6 rounded mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                placeholder="Question text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
              >
                Add Question
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-slate-800 p-6 rounded">
              <p className="text-white">{q.text}</p>
              <button
                onClick={() => handleDelete(q.id)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
