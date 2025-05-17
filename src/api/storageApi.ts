import axios from 'axios';

const BASE_URL = 'http://localhost:8083';

const storageApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor để tự động gắn token vào request
storageApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy CSRF token từ cookie
export const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1] || '';
};

// Lấy thông tin file từ storageId
export const getStorageById = async (storageId: string) => {
  try {
    console.log(`Đang lấy storage với ID: ${storageId}`);
    const csrfToken = getCsrfToken();
    const response = await storageApi.get(`/storage/${storageId}`, {
      headers: {
        'X-CSRFToken': csrfToken,
      },
    });
    console.log('Storage API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy storage:', error);
    throw error;
  }
};

// Lấy danh sách storage
export const getStorages = async (page = 1, pageSize = 10) => {
  const csrfToken = getCsrfToken();
  const response = await storageApi.get(`/storages?page=${page}&pageSize=${pageSize}`, {
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
  return response.data;
};

// Upload file
export const uploadFile = async (file: File) => {
  const csrfToken = getCsrfToken();
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/storage/upload`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
    credentials: 'include',
  });
  
  return await response.json();
};

// Lấy URL ảnh từ storageImageId (dùng lại endpoint giống storageId)
export const getImageUrl = async (storageImageId: string) => {
  if (!storageImageId) return null;
  
  try {
    console.log(`Đang lấy URL ảnh từ storageImageId: ${storageImageId}`);
    console.log(`Gọi API: ${BASE_URL}/storage/${storageImageId}`);
    
    // Truy cập trực tiếp, không qua hàm getStorageById để debug rõ hơn
    const csrfToken = getCsrfToken();
    const response = await storageApi.get(`/storage/${storageImageId}`, {
      headers: {
        'X-CSRFToken': csrfToken,
      },
    });
    
    console.log('Response từ API lấy ảnh:', response);
    
    if (response.data?.success && response.data?.data?.fileUrl) {
      console.log('Đã lấy được URL ảnh:', response.data.data.fileUrl);
      return response.data.data.fileUrl;
    }
    
    console.error('Không lấy được URL ảnh:', response.data);
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy URL ảnh:', error);
    return null;
  }
};

export default storageApi; 