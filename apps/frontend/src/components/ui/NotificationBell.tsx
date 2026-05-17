import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";

export function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!currentUser) return;
    try {
      const res = await notificationsApi.findMine();
      setItems(res.data || []);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [currentUser]);

  const unread = items.filter((i) => !i.read).length;

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationMessage = (type: string, payload: any) => {
    switch (type) {
      case "review_assigned":
        return "New candidate review assigned";
      case "review_result":
        return payload?.result === "accepted"
          ? "Tech lead accepted a candidate — schedule interview"
          : "Tech lead rejected a candidate";
      case "interview_scheduled":
        return "Interview scheduled";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const handleNotificationClick = async (item: any) => {
    if (!item.read) {
      try {
        await notificationsApi.markRead(item.id);
      } catch (e) {
        console.error(e);
      }
    }

    if (item.type === "review_assigned") {
      navigate("/techlead/reviews");
    } else if (item.type === "interview_scheduled") {
      navigate(
        currentUser?.role === "tech_lead"
          ? "/techlead/interviews"
          : "/dashboard",
      );
    } else if (item.type === "review_result" && item.payload?.candidateId) {
      navigate(`/candidates/${item.payload.candidateId}`);
    } else if (item.type === "review_result") {
      navigate("/jobs");
    }

    setOpen(false);
    load();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        className="relative rounded-md p-2 hover:bg-slate-800/50 transition"
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <div className="text-sm font-semibold text-white">Notifications</div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-700">
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications
              </div>
            )}
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => handleNotificationClick(it)}
                className={`w-full text-left px-4 py-3 transition hover:bg-slate-700/50 ${
                  it.read ? "opacity-60" : "bg-slate-900/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!it.read && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">
                      {getNotificationMessage(it.type, it.payload)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(it.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
