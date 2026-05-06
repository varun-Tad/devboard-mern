import express from "express";
import {
  addComment,
  getCommentsByTask,
} from "../controllers/comment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, addComment);
router.get("/task/:taskId", protect, getCommentsByTask);

export default router;
