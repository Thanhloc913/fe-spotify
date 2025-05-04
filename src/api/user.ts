import { Album, Track } from '../types';

const USER_ALBUMS_KEY = 'user_albums';
const USER_FAVORITES_KEY = 'user_favorite_tracks';
const USER_PLAYLISTS_KEY = 'user_playlists';

export function createAlbum(album: Album): Promise<Album> {
  const albums = JSON.parse(localStorage.getItem(USER_ALBUMS_KEY) || '[]');
  albums.push(album);
  localStorage.setItem(USER_ALBUMS_KEY, JSON.stringify(albums));
  return Promise.resolve(album);
}

export function getUserAlbums(): Promise<Album[]> {
  const albums = JSON.parse(localStorage.getItem(USER_ALBUMS_KEY) || '[]');
  return Promise.resolve(albums);
}

export function addFavoriteTrack(track: Track): Promise<void> {
  const tracks = JSON.parse(localStorage.getItem(USER_FAVORITES_KEY) || '[]');
  if (!tracks.find((t: Track) => t.id === track.id)) {
    tracks.push(track);
    localStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(tracks));
  }
  return Promise.resolve();
}

export function removeFavoriteTrack(trackId: string): Promise<void> {
  let tracks = JSON.parse(localStorage.getItem(USER_FAVORITES_KEY) || '[]');
  tracks = tracks.filter((t: Track) => t.id !== trackId);
  localStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(tracks));
  return Promise.resolve();
}

export function getFavoriteTracks(): Promise<Track[]> {
  const tracks = JSON.parse(localStorage.getItem(USER_FAVORITES_KEY) || '[]');
  return Promise.resolve(tracks);
}

export interface UserPlaylist {
  id: string;
  name: string;
  coverUrl: string;
  trackIds: string[];
}

export function createPlaylist(playlist: UserPlaylist): Promise<UserPlaylist> {
  const playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  playlists.push(playlist);
  localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return Promise.resolve(playlist);
}

export function getUserPlaylists(): Promise<UserPlaylist[]> {
  const playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  return Promise.resolve(playlists);
}

export function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  const playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist && !playlist.trackIds.includes(trackId)) {
    playlist.trackIds.push(trackId);
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  const playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist) {
    playlist.trackIds = playlist.trackIds.filter((id: string) => id !== trackId);
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function renamePlaylist(playlistId: string, newName: string): Promise<void> {
  const playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  const playlist = playlists.find((p: UserPlaylist) => p.id === playlistId);
  if (playlist) {
    playlist.name = newName;
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve();
}

export function deletePlaylist(playlistId: string): Promise<void> {
  let playlists = JSON.parse(localStorage.getItem(USER_PLAYLISTS_KEY) || '[]');
  playlists = playlists.filter((p: UserPlaylist) => p.id !== playlistId);
  localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
  return Promise.resolve();
} 