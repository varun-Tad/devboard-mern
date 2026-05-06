import TaskCard from "./TaskCard";

const columns = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard({ tasks, onTaskClick, onDropTask }) {
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    onDropTask(taskId, status);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {columns.map((column) => {
        const filteredTasks = tasks.filter(
          (task) => task.status === column.key,
        );

        return (
          <div
            key={column.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.key)}
            className="min-h-[500px] rounded-2xl bg-slate-50 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{column.title}</h2>

              <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                {filteredTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                >
                  <TaskCard task={task} onClick={() => onTaskClick(task)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
