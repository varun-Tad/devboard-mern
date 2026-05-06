import { MessageCircle } from "lucide-react";

export default function TaskCard({ task, onClick }) {
  const priorityClass = {
    low: "bg-green-100 text-green-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{task.title}</h3>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            priorityClass[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-slate-500">
        {task.description || "No description"}
      </p>

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {task.status}
        </span>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MessageCircle size={14} />
          Comments
        </div>
      </div>
    </div>
  );
}
