import axios from "axios";

const profileApi = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để tự động gắn token vào request nếu có
profileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy CSRF token từ cookie
const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1] || '';
};

export const getProfile = async () => {
  const response = await profileApi.get('/profile');
  return response.data;
};

export const updateProfile = async (profileData: {
  fullName: string;
  dateOfBirth: string;
  bio: string;
  phoneNumber: string;
  avatarUrl: string;
}) => {
  const csrfToken = getCsrfToken();
  const response = await profileApi.post('/profile/update', profileData, {
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

export const getProfileByAccountID = async (accountID: string) => {
  const csrfToken = getCsrfToken();
  const response = await profileApi.post(
    '/profiles',
    { accountID },
    {
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

export default profileApi; 