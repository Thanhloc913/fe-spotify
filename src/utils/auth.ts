// utils/auth.ts

export const getToken = () => {
  return sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
};

export const getRefreshToken = () => {
  return sessionStorage.getItem('refresh_token');
};

export const setToken = (token: string) => {
  localStorage.setItem('access_token', token);
};

export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem('refresh_token', refreshToken);
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('refresh_token');
};
  