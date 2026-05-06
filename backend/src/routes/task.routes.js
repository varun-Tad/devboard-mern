import express from "express";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  uploadTaskAttachment,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.patch("/:id/status", protect, updateTaskStatus);
router.post(
  "/:taskId/attachments",
  protect,
  upload.single("file"),
  uploadTaskAttachment,
);

export default router;
