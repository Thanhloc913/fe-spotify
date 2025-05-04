import axios from "axios";

// Tạo instance axios
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để tự động gắn token vào request nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy CSRF token
const getCsrfToken = async (): Promise<string> => {
  try {
    const { data } = await api.get("/csrf");
    const csrfToken = data?.data?.token;
    if (!csrfToken) throw new Error("Không có token trong phản hồi");
    return csrfToken;
  } catch (error) {
    console.error("Không lấy được CSRF token:", error);
    throw new Error("Không lấy được CSRF token");
  }
};

// Gọi API login
export const login = async (
  accountInput: string,
  password: string
): Promise<{ data: { token: string } }> => {
  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountInput);
    const payload = isEmail
      ? { email: accountInput, password }
      : { username: accountInput, password };

    const csrfToken = await getCsrfToken();

    const response = await api.post(
      "/login",
      payload,
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );

    const { access_token, refresh_token, account } = response.data.data;

    if (access_token) {
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("account_id", account.id);
      return { data: { token: access_token } };
    } else {
      throw new Error("Không nhận được access token");
    }
  } catch (error: any) {
    console.error("Lỗi login:", error);
    throw new Error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
  }
};

export default api;
