import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js";

export const addComment = async (req, res) => {
  const { taskId, message } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findOne({
    _id: task.project,
    members: req.user._id,
  });

  if (!project) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const comment = await Comment.create({
    task: taskId,
    user: req.user._id,
    message,
  });

  await Activity.create({
    project: task.project,
    user: req.user._id,
    action: `commented on task "${task.title}"`,
    entityType: "comment",
    entityId: comment._id,
  });

  const populatedComment = await comment.populate("user", "name email");

  res.status(201).json(populatedComment);
};

export const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findOne({
    _id: task.project,
    members: req.user._id,
  });

  if (!project) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const comments = await Comment.find({ task: taskId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(comments);
};
