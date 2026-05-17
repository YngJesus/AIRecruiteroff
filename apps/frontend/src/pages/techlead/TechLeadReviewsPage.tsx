import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { reviewsApi, type Review, type ReviewQuestion } from "../../api/reviews";
import { PageShell, fieldClass } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { MatchScoreRing } from "../../components/ui/MatchScoreRing";
import { EmptyState } from "../../components/ui/EmptyState";

function ReviewCard({
  review,
  onProcessed,
}: {
  review: Review;
  onProcessed: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [questions, setQuestions] = useState<ReviewQuestion[]>(
    review.questions ?? [],
  );
  const [newQuestion, setNewQuestion] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [processing, setProcessing] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const c = review.candidate;
  const displayScore = review.score ?? c?.matchScore ?? 0;

  const saveQuestions = async () => {
    setSavingQuestions(true);
    setError("");
    try {
      await reviewsApi.updateQuestions(review.id, questions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSavingQuestions(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([
      ...questions,
      {
        question: newQuestion.trim(),
        skill: newSkill.trim() || "General",
        difficulty: "medium",
        type: "custom",
      },
    ]);
    setNewQuestion("");
    setNewSkill("");
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleAccept = async () => {
    setProcessing(true);
    setError("");
    try {
      if (questions.length > 0) {
        await reviewsApi.updateQuestions(review.id, questions);
      }
      await reviewsApi.accept(review.id);
      onProcessed();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to accept");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    setError("");
    try {
      await reviewsApi.reject(review.id);
      onProcessed();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex flex-wrap items-center gap-4 hover:bg-slate-800/30 transition"
      >
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-lg font-semibold text-white">
            {c?.cvFileName?.replace(/\.[^.]+$/, "") || "Candidate"}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            {c?.jobTitle || "Job"} Â· sent for your review
          </p>
        </div>
        <MatchScoreRing score={displayScore} size="lg" />
        <span className="rounded-full bg-amber-950/80 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-800/50">
          PENDING
        </span>
        <span className="text-slate-500 text-sm">{expanded ? "â–²" : "â–¼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-800/80 p-5 space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-800/60 bg-rose-950/50 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {review.notes && (
            <div className="rounded-xl bg-slate-800/40 p-4 border border-slate-700/50">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">
                HR notes
              </p>
              <p className="text-slate-200 text-sm">{review.notes}</p>
            </div>
          )}

          {c?.skillGaps && c.skillGaps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                Skill breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {c.skillGaps.map((g: any, i: number) => (
                  <span
                    key={i}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      g.status === "match"
                        ? "bg-emerald-950/80 text-emerald-200"
                        : g.status === "partial"
                          ? "bg-amber-950/80 text-amber-200"
                          : "bg-rose-950/80 text-rose-200"
                    }`}
                  >
                    {g.skill}: {g.status}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-300">
                Interview questions ({questions.length})
              </h4>
              <div className="flex gap-2">
                {saved && (
                  <span className="text-xs text-emerald-400">Saved</span>
                )}
                <button
                  type="button"
                  onClick={saveQuestions}
                  disabled={savingQuestions}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {savingQuestions ? "Savingâ€¦" : "Save questions"}
                </button>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 rounded-xl border border-slate-700/60 bg-slate-800/30 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-blue-400 font-medium">
                      {q.skill || "General"}
                    </span>
                    {q.type === "custom" && (
                      <span className="ml-2 text-xs text-violet-400">custom</span>
                    )}
                    <p className="text-sm text-slate-200 mt-1">{q.question}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="shrink-0 text-rose-400 hover:text-rose-300 text-sm px-2"
                    title="Remove question"
                  >
                    âœ•
                  </button>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-sm text-slate-500">No questions yet.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Skill (optional)"
                className={`flex-1 min-w-[120px] ${fieldClass} text-sm py-2`}
              />
              <input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                placeholder="Add a questionâ€¦"
                className={`flex-[2] min-w-[200px] ${fieldClass} text-sm py-2`}
              />
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-between pt-2 border-t border-slate-800">
            {c?.id && (
              <Link
                to={`/candidates/${c.id}`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Full candidate profile â†’
              </Link>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={handleReject}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-rose-600/90 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {processing ? "Processingâ€¦" : "Accept for interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
export function TechLeadReviewsPage() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await reviewsApi.findByTechLead(currentUser.id);
      setReviews(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currentUser]);

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <PageHeader
        eyebrow="Reviews"
        title="Candidate review queue"
        description="Expand a card to edit interview questions, then accept for an interview or reject."
      />
      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-4 text-rose-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="ðŸ“‹"
          title="No pending reviews"
          description="When HR sends candidates from your department, they appear here."
          action={
            <Link
              to="/techlead/calendar"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Set availability
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} onProcessed={load} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
