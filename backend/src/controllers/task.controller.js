import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js";

import { redisClient } from "../config/redis.js";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

const clearProjectTaskCache = async (projectId) => {
  const keys = await redisClient.keys(`tasks:${projectId}:*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, projectId } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project: projectId,
      createdBy: req.user._id,
    });

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: `created task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    await clearProjectTaskCache(projectId);

    const io = req.app.get("io");

    io.to(projectId.toString()).emit("task-created", task);

    res.status(201).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId, page = 1, limit = 10, search = "" } = req.query;

    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const cacheKey = `tasks:${projectId}:page:${page}:limit:${limit}:search:${search}`;

    const cachedTasks = await redisClient.get(cacheKey);

    if (cachedTasks) {
      return res.json(JSON.parse(cachedTasks));
    }

    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      project: projectId,

      ...(search && {
        $text: {
          $search: search,
        },
      }),
    };

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalTasks = await Task.countDocuments(query);

    const response = {
      tasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / Number(limit)),
      hasMore: skip + tasks.length < totalTasks,
      totalTasks,
    };

    await redisClient.setEx(cacheKey, 60, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      members: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    task.status = status;

    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `moved task "${task.title}" to ${status}`,
      entityType: "task",
      entityId: task._id,
    });

    await clearProjectTaskCache(task.project.toString());

    const io = req.app.get("io");

    io.to(task.project.toString()).emit("task-updated", task);

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task status",
    });
  }
};

export const uploadTaskAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      members: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const fileKey = `devboard/tasks/${taskId}/${Date.now()}-${
      req.file.originalname
    }`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    task.attachments.push({
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
    });

    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `uploaded attachment to task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    await clearProjectTaskCache(task.project.toString());

    const io = req.app.get("io");

    io.to(task.project.toString()).emit("task-updated", task);

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to upload attachment",
    });
  }
};
