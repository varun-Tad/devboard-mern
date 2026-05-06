import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

export const getProjectActivities = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findOne({
    _id: projectId,
    members: req.user._id,
  });

  if (!project) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const activities = await Activity.find({ project: projectId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(30);

  res.json(activities);
};
