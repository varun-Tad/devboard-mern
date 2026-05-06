import { useEffect, useState } from "react";

import { addComment, getCommentsByTask } from "../api/commentApi";
import { uploadTaskAttachment } from "../api/taskApi";

export default function TaskModal({ task, onClose }) {
  const [currentTask, setCurrentTask] = useState(task);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const fetchComments = async () => {
    const res = await getCommentsByTask(task._id);
    setComments(res.data);
  };

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      const res = await addComment({
        taskId: currentTask._id,
        message,
      });

      setComments((prev) => [res.data, ...prev]);
      setMessage("");
    } catch (error) {
      console.error(error);
      alert("Failed to add comment");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const res = await uploadTaskAttachment(currentTask._id, file);
      setCurrentTask(res.data);
    } catch (error) {
      console.error(error);
      alert("File upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentTask.title}
            </h2>

            <p className="text-sm text-slate-500">
              {currentTask.status} · {currentTask.priority}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <h3 className="mb-2 font-semibold text-slate-800">Description</h3>

          <p className="text-sm text-slate-600">
            {currentTask.description || "No description added."}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <h3 className="mb-3 font-semibold text-slate-800">Attachments</h3>

          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />

          {uploading && (
            <p className="mt-2 text-sm text-slate-500">Uploading...</p>
          )}

          <div className="mt-4 space-y-2">
            {currentTask.attachments?.map((file, index) => (
              <a
                key={index}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg bg-white p-3 text-sm text-blue-600 shadow-sm hover:underline"
              >
                {file.fileName}
              </a>
            ))}

            {(!currentTask.attachments ||
              currentTask.attachments.length === 0) && (
              <p className="text-sm text-slate-400">No attachments yet.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[90px] w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
          />

          <button className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Add Comment
          </button>
        </form>

        <div>
          <h3 className="mb-3 font-semibold text-slate-800">Comments</h3>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  {comment.user?.name || "User"}
                </div>

                <p className="text-sm text-slate-600">{comment.message}</p>

                <div className="mt-2 text-xs text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-sm text-slate-400">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
