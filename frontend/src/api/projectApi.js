import API from "./axios";

export const createProject = (formData) => {
  return API.post("/projects", formData);
};

export const getProjects = () => {
  return API.get("/projects");
};

export const getProjectById = (id) => {
  return API.get(`/projects/${id}`);
};
