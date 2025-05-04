// utils/auth.ts

export const getToken = () => {
  return sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
};

export const getRefreshToken = () => {
  return sessionStorage.getItem('refresh_token');
};

export const setToken = (token: string) => {
  sessionStorage.setItem('token', token);
};

export const setRefreshToken = (refreshToken: string) => {
  sessionStorage.setItem('refresh_token', refreshToken);
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('refresh_token');
};
  