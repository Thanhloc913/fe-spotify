import type { ApiPagedRequest } from "./common";

export type ApiCreateAlbumRequest = {
  name: string;
  description: string;
  storageImageId: string | null;
  artistId: string;
};

export type ApiAlbumType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
  storageImageId: string;
  backgroundUrl: string | null;
  artistId: string;
};

export type ApiGetAlbumRequest = ApiPagedRequest & {
  name?: string;
};

export type ApiEditAlbumRequest = {
  id: string;
  name: string;
  description: string;
  artistId: string;
  storageImageId: string | null;
  removeImage: boolean;
};

export type ApiDeleteAlbumsRequest = {
  ids: string[];
};

export type ApiAlbumSongType = {
  albumID: string;
  songID: string;
};

export type ApiCreateAlbumSongRequest = {
  albumID: string;
  songID: string;
};

export type ApiCreateAlbumSongsRequest = {
  albumID: string;
  songIDs: string[];
};

export type ApiDeleteAlbumSongRequest = {
  albumID: string;
  songID: string;
};

export type ApiDeleteAlbumSongsRequest = {
  albumID: string;
  songIDs: string[];
};


