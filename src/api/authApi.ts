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
    const token = sessionStorage.getItem("token");
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
    const { data } = await api.get("/auth/csrf");
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
      "/auth/login",
      payload,
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );

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
  } catch (error: any) {
    console.error("Lỗi login:", error);
    throw new Error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
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
        ["no", "null", "undefined"].includes((registerData.avatarUrl || "").trim().toLowerCase())
          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8WOsLxlKgTXh7gry1qONjjpnozv1IwdHf165tgttVd5FiaWx4G8yOo4LCWt9uPt6y0EWxE89oyHdEPbgre41s8Q"
          : registerData.avatarUrl,
    };
    const response = await api.post("/auth/register", dataToSend, {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Lỗi register:", error);
    throw new Error(error.response?.data?.message || "Đăng ký thất bại!");
  }
};

// Hàm lấy thông tin tài khoản theo ID
export const getAccountById = async (accountId: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post(
      '/account/find',
      { id: accountId },
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi lấy thông tin tài khoản:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin tài khoản');
  }
};

// Hàm kiểm tra mật khẩu hiện tại
export const verifyCurrentPassword = async (email: string, currentPassword: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post(
      '/auth/login',
      { email, password: currentPassword },
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi kiểm tra mật khẩu:', error);
    throw new Error(error.response?.data?.message || 'Mật khẩu không chính xác');
  }
};

const getCookie = (name: string): string | null => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
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
    const csrftoken = getCookie('csrftoken');
    const accessToken = localStorage.getItem('access_token');
    const response = await api.post(
      '/account/update',
      { password: newPassword },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
          'Authorization': `Bearer ${accessToken}`
      },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi cập nhật mật khẩu:', error);
    throw new Error(error.response?.data?.message || 'Cập nhật mật khẩu thất bại');
  }
};

// Hàm kiểm tra email tồn tại
export const checkEmailExists = async (email: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post(
      '/account/find',
      { email },
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return response.data.success;
  } catch (error: any) {
    console.error('Lỗi kiểm tra email:', error);
    throw new Error(error.response?.data?.message || 'Không thể kiểm tra email');
  }
};

// Hàm yêu cầu đặt lại mật khẩu
export const requestPasswordReset = async (email: string) => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post(
      '/password-reset/request',
      { email },
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
    throw new Error(error.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
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
    const response = await api.post(
      '/password-reset/verify',
      {
        token,
        verification_code: verificationCode,
        new_password: newPassword,
      },
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi xác thực và đặt lại mật khẩu:', error);
    throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
  }
};

export default api;
