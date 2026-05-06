import { useEffect, useState } from "react";
import { getProjectActivities } from "../api/activityApi";

export default function ActivityPanel({ projectId, refreshKey }) {
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    const res = await getProjectActivities(projectId);
    setActivities(res.data);
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId, refreshKey]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-800">Activity Log</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity._id} className="border-l-2 border-blue-500 pl-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">
                {activity.user?.name || "User"}
              </span>{" "}
              {activity.action}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-sm text-slate-400">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
