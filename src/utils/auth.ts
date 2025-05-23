// utils/auth.ts

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

export const setToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem("refresh_token", refreshToken);
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("account_id");
  localStorage.removeItem("profile_id");
};
