import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [req.user._id],
  });

  res.status(201).json(project);
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({
    members: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(projects);
};

export const getProjectById = async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    members: req.user._id,
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
};
