export interface User {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
  following: {
    artists: string[];
    users: string[];
  };
  playlists: string[];
  createdAt: string;
}

export interface Profile {
  id: string;
  accountID: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

// Artist type definition
export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  genres: string[];
  monthlyListeners: number;
  albums: string[];
  singles: string[];
  topTracks: string[];
  related: string[];
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  isActive: boolean;
  accountID: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
}

// Album type definition
export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseDate: string;
  tracks: string[];
  type: "album" | "single" | "EP";
  totalTracks: number;
  durationMs: number;
}

// Track/Song type definition
export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  coverUrl?: string;
  previewUrl?: string;
  durationMs: number;
  explicit: boolean;
  popularity: number;
  trackNumber?: number;
  isPlayable?: boolean;
  videoUrl?: string | null;
  storageId?: string;
  storageImageId?: string;
  backgroundUrl?: string;
  songUrl?: string;
  songType?: 'SONG' | 'MUSIC_VIDEO';
}

export interface Genre {
  id: string; // UUID
  name: string;
  description: string;
}

export interface Role {
  id: string; // UUID
  name: string;
  description: string;
}

// Playlist type definition
export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  isCollaborative: boolean;
  tracks: string[];
  totalTracks: number;
  followers: number;
  createdAt: string;
}

// Category type definition
export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

// Search result type
export interface SearchResult {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  playlists: Playlist[];
}

// Player state type
export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  repeat: "off" | "track" | "context";
  shuffle: boolean;
  progress: number;
}

// API response structure
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  email?: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
    account: {
      id: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      isActive: boolean;
      roleId: string;
      username: string;
      email: string;
    };
  };
  message: string;
  success: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  data: {
    account: {
      id: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      isActive: boolean;
      roleId: string;
      username: string;
      email: string;
    };
    profile: {
      id: string;
      accountID: string;
      fullName: string;
      avatarUrl: string;
      bio: string;
      dateOfBirth: string;
      phoneNumber: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      isActive: boolean;
    };
  };
  message: string;
  success: boolean;
}

export interface FindAccountByEmailRequest {
  email: string;
}

export interface FindAccountByEmailResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isActive: boolean;
    roleId: string;
    email: string;
    username: string;
  };
}