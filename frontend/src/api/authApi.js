import API from "./axios";

export const registerUser = (formData) => {
  return API.post("/auth/register", formData);
};

export const loginUser = (formData) => {
  return API.post("/auth/login", formData);
};

export const getMe = () => {
  return API.get("/auth/me");
};

export const logoutUser = () => {
  return API.post("/auth/logout");
};
