import axios from "axios";
import { ApiProfileType } from "../types/api";

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
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
};

export const getProfile = async () => {
  const response = await profileApi.get("/profile");

  // Lưu profile ID vào localStorage
  if (response.data?.data?.id) {
    localStorage.setItem("profile_id", response.data.data.id);
  }

  return response.data;
};

export const updateProfile = async (profileData: {
  fullName: string;
  dateOfBirth: string;
  bio: string;
  phoneNumber: string;
  avatarUrl: string;
  isPremium?: boolean | null;
}) => {
  const csrfToken = getCsrfToken();
  const response = await profileApi.post("/profile/update", profileData, {
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

export const getProfileByAccountID = async (accountID: string) => {
  const csrfToken = getCsrfToken();
  const response = await profileApi.get(`/artist/${accountID}`, {
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

// export const getProfileByAccountID = async (accountID: string) => {
//   const csrfToken = getCsrfToken();
//   const response = await profileApi.post(
//     `/profiles`,
//     { accountID },
//     {
//       headers: {
//         "X-CSRFToken": csrfToken,
//       },
//     }
//   );
//   if (!response.data.success) throw new Error(response.data.message);
//   return response.data.data;
// };

export const getProfilesByIds = async (
  ids: string[]
): Promise<ApiProfileType[]> => {
  const response = await profileApi.get("/profiles", {
    params: {
      ids: ids,
    },
    paramsSerializer: {
      indexes: false,
    },
  });
  return response.data.data;
};

export const getIsPremium = async (): Promise<boolean> => {
  const pId = localStorage.getItem("profile_id");
  if (!pId) return false;
  const profile = (await getProfilesByIds([pId]))[0];
  return !!profile.isPremium;
};

export default profileApi;
