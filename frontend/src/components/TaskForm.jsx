import { useState } from "react";

export default function TaskForm({ projectId, onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onTaskCreated({
      ...formData,
      projectId,
    });

    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        placeholder="Task title"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
        style={styles.input}
      />

      <input
        placeholder="Task description"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        style={styles.input}
      />

      <select
        value={formData.priority}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, priority: e.target.value }))
        }
        style={styles.input}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button style={styles.button}>Add Task</button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  button: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
};
