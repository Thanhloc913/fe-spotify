import { Album, Track } from '../types';
import { getToken } from '../utils/auth';

const USER_ALBUMS_KEY = 'user_albums';
const USER_FAVORITES_KEY = 'user_favorite_tracks';
const USER_PLAYLISTS_KEY = 'user_playlists';

export function createAlbum(album: Album): Promise<Album> {
  if (!getToken()) return Promise.reject(new Error('No token'));
  const albums = JSON.parse(sessionStorage.getItem(USER_ALBUMS_KEY) || '[]');
  albums.push(album);
  sessionStorage.setItem(USER_ALBUMS_KEY, JSON.stringify(albums));
  return Promise.resolve(album);
}

export function getUserAlbums(): Promise<Album[]> {
  if (!getToken()) return Promise.reject(new Error('No token'));
  const albums = JSON.parse(sessionStorage.getItem(USER_ALBUMS_KEY) || '[]');
  return Promise.resolve(albums);
}

export function addFavoriteTrack(track: Track): Promise<void> {
  const tracks = JSON.parse(sessionStorage.getItem(USER_FAVORITES_KEY) || '[]');
  if (!tracks.find((t: Track) => t.id === track.id)) {
    tracks.push(track);
    sessionStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(tracks));
  }
  return Promise.resolve();
}

export function removeFavoriteTrack(trackId: string): Promise<void> {
  let tracks = JSON.parse(sessionStorage.getItem(USER_FAVORITES_KEY) || '[]');
  tracks = tracks.filter((t: Track) => t.id !== trackId);
  sessionStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(tracks));
  return Promise.resolve();
}

export function getFavoriteTracks(): Promise<Track[]> {
  if (!getToken()) return Promise.reject(new Error('No token'));
  const tracks = JSON.parse(sessionStorage.getItem(USER_FAVORITES_KEY) || '[]');
  return Promise.resolve(tracks);
}

export interface UserPlaylist {
  id: string;
  name: string;
  coverUrl: string;
  trackIds: string[];
}

export function createPlaylist(playlist: UserPlaylist): Promise<UserPlaylist> {
  const playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  playlists.push(playlist);
  sessionStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return Promise.resolve(playlist);
}

export function getUserPlaylists(): Promise<UserPlaylist[]> {
  if (!getToken()) return Promise.reject(new Error('No token'));
  const playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  return Promise.resolve(playlists);
}

export function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  const playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist && !playlist.trackIds.includes(trackId)) {
    playlist.trackIds.push(trackId);
    sessionStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  const playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist) {
    playlist.trackIds = playlist.trackIds.filter((id: string) => id !== trackId);
    sessionStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function renamePlaylist(playlistId: string, newName: string): Promise<void> {
  const playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist) {
    playlist.name = newName;
    sessionStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function deletePlaylist(playlistId: string): Promise<void> {
  let playlists = JSON.parse(sessionStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  playlists = playlists.filter((p: UserPlaylist) => p.id !== playlistId);
  sessionStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return Promise.resolve();
} 