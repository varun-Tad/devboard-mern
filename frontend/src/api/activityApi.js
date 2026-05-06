import API from "./axios";

export const getProjectActivities = (projectId) => {
  return API.get(`/activities/project/${projectId}`);
};
