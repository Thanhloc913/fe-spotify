import axios from 'axios';
import { ApiResponse, User } from '../types/index';

// Cấu hình base URL (backend Django tại localhost)
const API_URL = 'http://localhost:8000';

// Cấu hình axios mặc định: gửi cookie trong mọi request
axios.defaults.withCredentials = true;

// Hàm lấy CSRF token từ cookie (chuẩn giống fetch)
const getCookie = (name: string): string | null => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// ✅ Hàm gọi trước để lấy CSRF token từ backend và set cookie
export const getCsrfToken = async (): Promise<void> => {
  try {
    await axios.get(`${API_URL}/`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Lỗi khi lấy CSRF token:', error);
  }
};

// ✅ Đăng nhập
export const login = async (email: string, password: string): Promise<ApiResponse<{ token: string }>> => {
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || '',
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    } else {
      throw new Error('Đăng nhập thất bại');
    }
  }
};

// ✅ Đăng ký
export const register = async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await axios.post(`${API_URL}/register/`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || '',
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    } else {
      throw new Error('Đăng ký thất bại');
    }
  }
};

// ✅ Kiểm tra token
export const checkToken = async (): Promise<ApiResponse<{ valid: boolean }>> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token không tồn tại');

    const response = await axios.get(`${API_URL}/check/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response?.data?.message || 'Token không hợp lệ');
    } else {
      throw new Error('Token không hợp lệ');
    }
  }
};
