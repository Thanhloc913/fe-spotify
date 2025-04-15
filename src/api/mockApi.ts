// 📁 src/api/mockApi.ts
import { generateArtists, updateArtistsWithContent } from './artistApi';
import { generateAlbums } from './albumApi';
import { generateTracks } from './trackApi';
import { generateCategories } from './categoryApi';
import { generatePlaylists } from './playlistApi';
import { generateUsers, updateUsersWithContent } from './userApi';

export const generateMockData = () => {
  const categories = generateCategories();
  const artists = generateArtists();
  const albums = generateAlbums(artists, 50);
  const tracks = generateTracks(albums);
  const users = generateUsers();
  const playlists = generatePlaylists(users, tracks, 30);

  const updatedArtists = updateArtistsWithContent(artists, albums, tracks);
  const updatedUsers = updateUsersWithContent(users, updatedArtists, playlists);

  return {
    categories,
    artists: updatedArtists,
    albums,
    tracks,
    users: updatedUsers,
    playlists,
  };
};
