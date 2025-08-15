import type { ApiPagedRequest } from "./common";

export type ApiSongType = {
  id: string;
  songUrl: string;
  backgroundUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  title: string;
  description: string;
  artistId: string;
  duration: number;
  songType: "MUSIC_VIDEO" | "SONG";
};

export type ApiFavoriteSongType = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  profileID: string;
  songID: string;
};

export type ApiGetSongsByAlbumIdRequest = ApiPagedRequest & {
  albumId: string;
};

export type ApiSongCreateRequest = {
  title: string;
  artistId: string;
  genreId: string[];
  storageId: string;
  storageImageId: string | null;
  duration: number;
  description: string;
  albumId: string[];
  songType: "MUSIC_VIDEO" | "SONG";
};

export type ApiSongUpdateRequest = {
  id: string;
  title: string;
  storageImageId: string | null;
  duration: number;
  description: string;
  songType: "MUSIC_VIDEO" | "SONG";
  removeImage: boolean;
};

export type ApiDeleteSongsRequest = {
  ids: string[];
};


