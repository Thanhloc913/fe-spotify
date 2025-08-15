import axios from "axios";
import { ApiPaginatedResult, ApiResponse } from "../types/api";
import type {
  ApiAccountType,
  ApiCreateAccountRequest,
  ApiDeleteAccountRequest,
  ApiGetAccountRequest,
  ApiUpdateAccountRequest,
} from "../types/api/account";
import type {
  ApiRoleType,
  ApiCreateRoleRequest,
  ApiEditRoleRequest,
  ApiGetRoleRequest,
  ApiDeleteRolesRequest,
} from "../types/api/role";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

type Deferred<T> = {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Deferred<string>[] = [];

const processQueue = (error?: unknown, token?: string) => {
  failedQueue.forEach((deferred) => {
    if (error) {
      deferred.reject(error);
    } else if (typeof token === "string") {
      deferred.resolve(token);
    }
  });
  failedQueue = [];
};

const getAxiosErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: string } | undefined)
      ?.message;
    return message ?? fallback;
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");
      try {
        const res = await axios.post(
          "http://localhost:8080/auth/refresh-token",
          {
            refreshToken: refreshToken,
          }
        );
        const { access_token, refresh_token } = res.data.data;
        localStorage.setItem("access_token", access_token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }
        axiosClient.defaults.headers.common["Authorization"] =
          "Bearer " + access_token;
        processQueue(null, access_token);
        isRefreshing = false;
        originalRequest.headers["Authorization"] = "Bearer " + access_token;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err);
        isRefreshing = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("account_id");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

// Lấy CSRF token
const getCsrfToken = async (): Promise<string> => {
  try {
    const { data } = await axiosClient.get("/auth/csrf");
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

    const response = await axiosClient.post("/auth/login", payload, {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });

    const { access_token, refresh_token, account } = response.data.data;
    const csrfTokenFromResponse = response.data.data.token;

    if (access_token) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("account_id", account.id);
      if (csrfTokenFromResponse) {
        sessionStorage.setItem("csrf_token", csrfTokenFromResponse);
      }
      return { data: { token: access_token } };
    } else {
      throw new Error("Không nhận được access token");
    }
  } catch (error: unknown) {
    console.error("Lỗi login:", error);
    throw new Error(
      getAxiosErrorMessage(error, "Sai tài khoản hoặc mật khẩu!")
    );
  }
};

// Gọi API register
export const register = async (registerData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}) => {
  try {
    const csrfToken = await getCsrfToken();
    const dataToSend = {
      ...registerData,
      avatarUrl:
        !registerData.avatarUrl ||
        ["no", "null", "undefined"].includes(
          (registerData.avatarUrl || "").trim().toLowerCase()
        )
          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8WOsLxlKgTXh7gry1qONjjpnozv1IwdHf165tgttVd5FiaWx4G8yOo4LCWt9uPt6y0EWxE89oyHdEPbgre41s8Q"
          : registerData.avatarUrl,
    };
    const response = await axiosClient.post("/auth/register", dataToSend, {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi register:", error);
    throw new Error(getAxiosErrorMessage(error, "Đăng ký thất bại!"));
  }
};

// Hàm lấy thông tin tài khoản theo ID
export const getAccountById = async (accountId: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await axiosClient.post(
      "/account/find",
      { id: accountId },
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi lấy thông tin tài khoản:", error);
    throw new Error(
      getAxiosErrorMessage(
        error,
        "Không thể lấy thông tin tài khoản"
      )
    );
  }
};

// Hàm kiểm tra mật khẩu hiện tại
export const verifyCurrentPassword = async (
  email: string,
  currentPassword: string
) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await axiosClient.post(
      "/auth/login",
      { email, password: currentPassword },
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi kiểm tra mật khẩu:", error);
    throw new Error(
      getAxiosErrorMessage(error, "Mật khẩu không chính xác")
    );
  }
};

const getCookie = (name: string): string | null => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Hàm cập nhật mật khẩu
export const updatePassword = async (newPassword: string) => {
  try {
    const csrftoken = getCookie("csrftoken");
    const accessToken = localStorage.getItem("access_token");
    const response = await axiosClient.post(
      "/account/update",
      { password: newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    throw new Error(
      getAxiosErrorMessage(error, "Cập nhật mật khẩu thất bại")
    );
  }
};

// Hàm kiểm tra email tồn tại
export const checkEmailExists = async (email: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await axiosClient.post(
      "/account/find",
      { email },
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
    return response.data.success;
  } catch (error: unknown) {
    console.error("Lỗi kiểm tra email:", error);
    throw new Error(getAxiosErrorMessage(error, "Không thể kiểm tra email"));
  }
};

// Hàm yêu cầu đặt lại mật khẩu
export const requestPasswordReset = async (email: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await axiosClient.post(
      "/password-reset/request",
      { email },
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi yêu cầu đặt lại mật khẩu:", error);
    throw new Error(
      getAxiosErrorMessage(
        error,
        "Không thể gửi yêu cầu đặt lại mật khẩu"
      )
    );
  }
};

// Hàm xác thực và đặt lại mật khẩu
export const verifyAndResetPassword = async (
  token: string,
  verificationCode: string,
  newPassword: string
) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await axiosClient.post(
      "/password-reset/verify",
      {
        token,
        verification_code: verificationCode,
        new_password: newPassword,
      },
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi xác thực và đặt lại mật khẩu:", error);
    throw new Error(
      getAxiosErrorMessage(error, "Không thể đặt lại mật khẩu")
    );
  }
};

export async function getRoles(
  body: ApiGetRoleRequest = { page: 1, pageSize: 100 }
): Promise<ApiPaginatedResult<ApiRoleType>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CSRFToken": (await getCsrfToken()) || "",
    Authorization: `Bearer ${getAuthToken() || ""}`,
  };

  try {
    const response = await fetch("http://localhost:8080/roles", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (response.status === 404) {
      return {
        result: [],
        currentPage: 1,
        total: 0,
        totalPages: 0,
      };
    }
    const result: ApiResponse<ApiPaginatedResult<ApiRoleType>> =
      await response.json();
    console.log("Response:", result);
    return result.data;
  } catch (error) {
    console.error("Error:", error);
    return Promise.reject(error);
  }
}

export async function apiRequest<T, U>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: U
): Promise<T> {
  // ... (same apiRequest function as before)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CSRFToken": (await getCsrfToken()) || "",
    Authorization: `Bearer ${getAuthToken() || ""}`,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const result: ApiResponse<T> = await response.json();
    console.log(`Response (${method} ${url}):`, result);
    if (result.success && result.data) {
      return result.data;
    } else {
      return Promise.reject(
        result.message || `Request failed with status ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Error (${method} ${url}):`, error);
    return Promise.reject(error);
  }
}

export async function createRole(
  body: ApiCreateRoleRequest
): Promise<ApiRoleType> {
  return apiRequest<ApiRoleType, ApiCreateRoleRequest>(
    "http://localhost:8080/role/create",
    "POST",
    body
  );
}

export async function editRole(body: ApiEditRoleRequest): Promise<ApiRoleType> {
  return apiRequest<ApiRoleType, ApiEditRoleRequest>(
    "http://localhost:8080/role/update",
    "POST",
    body
  );
}

export async function deleteRoles(ids: string[]): Promise<unknown> {
  const body: ApiDeleteRolesRequest = { ids };
  return apiRequest<unknown, ApiDeleteRolesRequest>(
    "http://localhost:8080/role/delete",
    "POST",
    body
  );
}

export async function getAccounts(
  body: ApiGetAccountRequest = { page: 1, pageSize: 100 }
): Promise<ApiPaginatedResult<ApiAccountType>> {
  return apiRequest<ApiPaginatedResult<ApiAccountType>, typeof body>(
    "http://localhost:8080/account/find",
    "POST",
    body
  );
}

export async function createAccount(
  body: ApiCreateAccountRequest
): Promise<ApiAccountType> {
  return apiRequest<ApiAccountType, typeof body>(
    "http://localhost:8080/account/create",
    "POST",
    body
  );
}

export async function editAccount(
  body: ApiUpdateAccountRequest
): Promise<ApiAccountType> {
  return apiRequest<ApiAccountType, typeof body>(
    "http://localhost:8080/account/update",
    "POST",
    body
  );
}

export async function deleteAccount(id: string): Promise<unknown> {
  return apiRequest<unknown, ApiDeleteAccountRequest>(
    "http://localhost:8080/account/delete",
    "POST",
    { id }
  );
}

export async function deleteAccountMany(
  body: ApiDeleteAccountRequest[]
): Promise<PromiseSettledResult<ApiAccountType>[]> {
  return Promise.allSettled(
    body.map((req) =>
      apiRequest<ApiAccountType, ApiDeleteAccountRequest>(
        "http://localhost:8080/account/delete",
        "POST",
        req
      )
    )
  );
}

// Helper function to get authorization token from localStorage
export function getAuthToken() {
  return localStorage.getItem("access_token");
}

export default axiosClient;
