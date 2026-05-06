import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProjectById } from "../api/projectApi";
import { createTask, getTasks, updateTaskStatus } from "../api/taskApi";
import { socket } from "../api/socket";

import SearchBar from "../components/SearchBar";
import TaskForm from "../components/TaskForm";
import KanbanBoard from "../components/KanbanBoard";
import TaskModal from "../components/TaskModal";
import ActivityPanel from "../components/ActivityPanel";

import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  const fetchProject = async () => {
    const res = await getProjectById(id);
    setProject(res.data);
  };

  const fetchTasks = async ({ reset = false, pageNumber = page } = {}) => {
    setLoading(true);

    try {
      const res = await getTasks({
        projectId: id,
        page: reset ? 1 : pageNumber,
        limit: 10,
        search: debouncedSearch,
      });

      if (reset) {
        setTasks(res.data.tasks);
        setPage(1);
      } else {
        setTasks((prev) => {
          const existingIds = new Set(prev.map((task) => task._id));

          const uniqueNewTasks = res.data.tasks.filter(
            (task) => !existingIds.has(task._id),
          );

          return [...prev, ...uniqueNewTasks];
        });
      }

      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    fetchTasks({ reset: true });
  }, [id, debouncedSearch]);

  useEffect(() => {
    socket.connect();
    socket.emit("join-project", id);

    socket.on("task-created", (newTask) => {
      setTasks((prev) => {
        const exists = prev.some((task) => task._id === newTask._id);

        if (exists) return prev;

        return [newTask, ...prev];
      });

      setActivityRefreshKey((prev) => prev + 1);
    });

    socket.on("task-updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)),
      );

      setSelectedTask((prev) =>
        prev?._id === updatedTask._id ? updatedTask : prev,
      );

      setActivityRefreshKey((prev) => prev + 1);
    });

    return () => {
      socket.emit("leave-project", id);
      socket.off("task-created");
      socket.off("task-updated");
      socket.disconnect();
    };
  }, [id]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;

    setPage(nextPage);

    fetchTasks({
      pageNumber: nextPage,
    });
  }, [hasMore, loading, page, debouncedSearch]);

  useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      await fetchTasks({ reset: true });

      setActivityRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    }
  };

  const handleDropTask = async (taskId, newStatus) => {
    const oldTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await updateTaskStatus(taskId, newStatus);

      setActivityRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setTasks(oldTasks);
      alert("Failed to update task status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Project</p>

          <h1 className="text-3xl font-bold text-slate-900">
            {project?.name || "Loading project..."}
          </h1>

          <p className="text-slate-500">{project?.description}</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <SearchBar value={search} onChange={setSearch} />

          <TaskForm projectId={id} onTaskCreated={handleCreateTask} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <KanbanBoard
            tasks={tasks}
            onTaskClick={setSelectedTask}
            onDropTask={handleDropTask}
          />

          <ActivityPanel projectId={id} refreshKey={activityRefreshKey} />
        </div>

        {loading && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Loading more tasks...
          </div>
        )}

        {!hasMore && tasks.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-400">
            You reached the end.
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No tasks found. Create your first task.
          </div>
        )}

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </div>
  );
}
