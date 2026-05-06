import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, getProjects } from "../api/projectApi";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    await createProject(formData);

    setFormData({
      name: "",
      description: "",
    });

    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">DevBoard</h1>
          <p className="text-slate-500">
            Manage projects, tasks, teams, and delivery workflows.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Create Project
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Project name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              placeholder="Project description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 md:col-span-1"
            />

            <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">
              <Plus size={18} />
              Create Project
            </button>
          </div>
        </form>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {project.name}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {project.description || "No description added"}
              </p>

              <div className="mt-5 text-xs font-medium text-blue-600">
                Open project →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
