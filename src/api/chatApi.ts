import axios from "axios";
import { apiRequest } from "./authApi";

const axiosClient = axios.create({
  baseURL: "http://localhost:8084",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Gắn CSRF token nếu có
    const csrfToken = sessionStorage.getItem("csrf_token");
    if (csrfToken && config.headers) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function sendPrompt(prompt: string): Promise<string> {
  try {
    const res = await apiRequest("http://localhost:8084/ask", "POST", {
      prompt,
    });
    return res.choices?.[0]?.message?.content || "Bot không trả lời được.";
  } catch {
    return "Có lỗi khi gọi chatbot.";
  }
}
