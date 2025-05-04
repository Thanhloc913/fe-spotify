// utils/auth.ts

export const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem('refresh_token', refreshToken);
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refresh_token');
};
  