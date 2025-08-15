export type ApiProfileType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  accountID: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  dateOfBirth: string;
  phoneNumber: string;
  isPremium?: boolean | null;
};


