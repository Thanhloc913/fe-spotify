import axios from "axios";

const BASE_URL = "http://localhost:8083";

const storageApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để tự động gắn token vào request
storageApi.interceptors.request.use(
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
export const getCsrfToken = () => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
};

// Lấy thông tin file từ storageId
export const getStorageById = async (storageId: string) => {
  try {
    console.log(`Đang lấy storage với ID: ${storageId}`);
    const csrfToken = getCsrfToken();
    const response = await storageApi.get(`/storage/${storageId}`, {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });
    console.log("Storage API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy storage:", error);
    throw error;
  }
};

// Lấy danh sách storage
export const getStorages = async (page = 1, pageSize = 10) => {
  const csrfToken = getCsrfToken();
  const response = await storageApi.get(
    `/storages?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    }
  );
  return response.data;
};

// Upload file
export const uploadFile = async (file: File) => {
  console.log("Đang tải lên tệp...");
  const formData = new FormData();
  formData.append("file", file);
  const headers = {
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  try {
    const response = await fetch(`${BASE_URL}/storage/upload`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    const result = await response.json();
    console.log("Upload Response:", result);
    return result;
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
};

// Create storage data function
export const createStorageData = async (data: {
  fileName: string;
  fileType: string;
  userId: string | null;
  fileUrl: string;
  fileSize: number;
  description: string;
}) => {
  console.log("Đang tạo dữ liệu lưu trữ...");
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  try {
    const response = await fetch(`${BASE_URL}/storage/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();
    console.log("Storage Response:", result);
    return result;
  } catch (error) {
    console.error("Storage Error:", error);
    return null;
  }
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
        "X-CSRFToken": csrfToken,
      },
    });

    console.log(
      "Response từ API lấy ảnh (chi tiết):",
      JSON.stringify(response.data, null, 2)
    );

    // Kiểm tra cấu trúc response
    if (response.data?.success) {
      console.log("Response success = true");
      console.log("data object:", response.data.data);

      // Xử lý fileUrl - có thể là đường dẫn tương đối
      if (response.data?.data?.fileUrl) {
        const fileUrl = response.data.data.fileUrl;
        console.log("Đã tìm thấy fileUrl:", fileUrl);

        // Kiểm tra nếu là đường dẫn tương đối thì thêm BASE_URL
        if (fileUrl && !fileUrl.startsWith("http")) {
          const fullUrl = `${BASE_URL}/${
            fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl
          }`;
          console.log("Đã chuyển sang URL tuyệt đối:", fullUrl);
          return fullUrl;
        }

        return fileUrl;
      } else {
        console.log("Không tìm thấy fileUrl trong response.data.data");

        // Kiểm tra nếu có URL trong dạng khác
        if (response.data.data?.url) {
          const url = response.data.data.url;
          console.log("Tìm thấy url thay vì fileUrl:", url);

          // Kiểm tra nếu là đường dẫn tương đối
          if (url && !url.startsWith("http")) {
            const fullUrl = `${BASE_URL}/${
              url.startsWith("/") ? url.substring(1) : url
            }`;
            console.log("Đã chuyển sang URL tuyệt đối:", fullUrl);
            return fullUrl;
          }

          return url;
        }

        // Kiểm tra trường filePath nếu có
        if (response.data.data?.filePath || response.data.data?.filepath) {
          const filePath =
            response.data.data?.filePath || response.data.data?.filepath;
          console.log("Tìm thấy filePath:", filePath);

          if (filePath && !filePath.startsWith("http")) {
            const fullUrl = `${BASE_URL}/${
              filePath.startsWith("/") ? filePath.substring(1) : filePath
            }`;
            console.log("Đã chuyển sang URL tuyệt đối:", fullUrl);
            return fullUrl;
          }

          return filePath;
        }

        // Log tất cả keys trong data để kiểm tra
        console.log(
          "Tất cả keys trong response.data.data:",
          Object.keys(response.data.data || {})
        );
      }
    }

    console.error("Không lấy được URL ảnh:", response.data);
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy URL ảnh:", error);
    return null;
  }
};

export default storageApi;

// Album creation function
export const createAlbum = async (albumData: {
  name: string;
  description: string;
  storageImageId: string;
  artistId: string;
}) => {
  console.log("Đang tạo album...");
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken(),
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  try {
    const response = await fetch(`http://localhost:8082/album/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(albumData),
      credentials: "include",
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error: any) {
    console.error("Lỗi:", error);
    return { status: 500, data: { error: error.message } };
  }
};
