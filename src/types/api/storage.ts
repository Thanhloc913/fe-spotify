export type ApiStorageUploadResponse = {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
};

export type ApiStorageCreateRequest = {
  fileName: string;
  fileType: string;
  userId: string;
  fileUrl: string;
  fileSize: number;
  description: string;
};

export type ApiStorageCreateResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string;
};


