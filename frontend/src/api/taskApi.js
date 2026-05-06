import API from "./axios";

export const createTask = (formData) => {
  return API.post("/tasks", formData);
};

export const getTasks = ({ projectId, page = 1, limit = 10, search = "" }) => {
  return API.get(
    `/tasks?projectId=${projectId}&page=${page}&limit=${limit}&search=${search}`,
  );
};

export const updateTaskStatus = (taskId, status) => {
  return API.patch(`/tasks/${taskId}/status`, { status });
};

export const uploadTaskAttachment = (taskId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
