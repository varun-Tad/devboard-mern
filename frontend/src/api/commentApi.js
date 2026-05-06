import API from "./axios";

export const addComment = (formData) => {
  return API.post("/comments", formData);
};

export const getCommentsByTask = (taskId) => {
  return API.get(`/comments/task/${taskId}`);
};
