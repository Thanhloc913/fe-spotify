import { faker } from '@faker-js/faker';
import type { User, Artist, Album, Track, Playlist, Category } from '../../types';

// Helper to generate a random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Helper to get random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to format duration in MS
const generateDurationMs = () => {
  return randomNumber(120000, 300000); // 2-5 min songs
};

// Generate categories
export const generateCategories = (count = 10): Category[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.music.genre(),
    imageUrl: faker.image.urlLoremFlickr({ category: 'music', width: 300, height: 300 }),
    description: faker.lorem.sentence(),
  }));
};

// Generate artists
export const generateArtists = (count = 20): Artist[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlLoremFlickr({ category: 'people', width: 300, height: 300 }),
    bio: faker.lorem.paragraph(),
    genres: Array.from({ length: randomNumber(1, 3) }, () => faker.music.genre()),
    monthlyListeners: randomNumber(10000, 10000000),
    albums: [],
    singles: [],
    topTracks: [],
    related: [],
  }));
};

// Generate albums - fixed parameter order
export const generateAlbums = (artists: Artist[], count = 30): Album[] => {
  if (!artists.length) return [];

  return Array.from({ length: count }, () => {
    const artist = faker.helpers.arrayElement(artists);
    const totalTracks = randomNumber(4, 12);
    const albumDuration = totalTracks * generateDurationMs();

    return {
      id: faker.string.uuid(),
      title: faker.music.songName(),
      artistId: artist.id,
      artistName: artist.name,
      coverUrl: faker.image.urlLoremFlickr({ category: 'album', width: 300, height: 300 }),
      releaseDate: faker.date.past({ years: 15 }).toISOString(),
      tracks: [], // Will be filled after generating tracks
      type: faker.helpers.arrayElement(['album', 'single', 'EP'] as const),
      totalTracks,
      durationMs: albumDuration
    };
  });
};

// Generate tracks - fixed forEach to for...of
export const generateTracks = (albums: Album[]): Track[] => {
  if (!albums.length) return [];

  const tracks: Track[] = [];

  for (const album of albums) {
    const albumTracks = Array.from({ length: album.totalTracks }, (_, i) => {
      const track: Track = {
        id: faker.string.uuid(),
        title: faker.music.songName(),
        artistId: album.artistId,
        artistName: album.artistName,
        albumId: album.id,
        albumName: album.title,
        coverUrl: album.coverUrl,
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        durationMs: 372000,
        explicit: faker.datatype.boolean(0.2),
        popularity: randomNumber(0, 100),
        trackNumber: i + 1,
        isPlayable: faker.datatype.boolean(0.9),
      };
      return track;
    });

    // Update album with track ids
    album.tracks = albumTracks.map(track => track.id);
    tracks.push(...albumTracks);
  }

  return tracks;
};

// Update artists with albums and tracks
export const updateArtistsWithContent = (
  artists: Artist[],
  albums: Album[],
  tracks: Track[]
): Artist[] => {
  return artists.map(artist => {
    const artistAlbums = albums.filter(album => album.artistId === artist.id);
    const artistTracks = tracks.filter(track => track.artistId === artist.id);

    // Randomly select some top tracks
    const topTracks = getRandomItems(artistTracks, Math.min(5, artistTracks.length)).map(t => t.id);

    // Find singles (albums with one track)
    const singles = artistAlbums
      .filter(album => album.type === 'single')
      .map(album => album.id);

    // Find proper albums
    const artistFullAlbums = artistAlbums
      .filter(album => album.type === 'album')
      .map(album => album.id);

    // Find related artists (for simplicity, just pick random artists)
    const related = getRandomItems(
      artists.filter(a => a.id !== artist.id),
      randomNumber(3, 5)
    ).map(a => a.id);

    return {
      ...artist,
      albums: artistFullAlbums,
      singles,
      topTracks,
      related,
    };
  });
};

// Generate users
export const generateUsers = (count = 10): User[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    profileImageUrl: faker.image.avatar(),
    following: {
      artists: [],
      users: [],
    },
    playlists: [],
    createdAt: faker.date.past({ years: 5 }).toISOString(),
  }));
};

// Generate playlists - fixed parameter order
export const generatePlaylists = (
  users: User[],
  tracks: Track[],
  count = 15
): Playlist[] => {
  if (!users.length || !tracks.length) return [];

  return Array.from({ length: count }, () => {
    const owner = faker.helpers.arrayElement(users);
    const playlistTracks = getRandomItems(tracks, randomNumber(10, 50)).map(t => t.id);

    return {
      id: faker.string.uuid(),
      name: faker.lorem.words({ min: 1, max: 3 }),
      description: faker.lorem.sentence(),
      coverUrl: faker.image.urlLoremFlickr({ category: 'abstract', width: 300, height: 300 }),
      ownerId: owner.id,
      ownerName: owner.name,
      isPublic: faker.datatype.boolean(0.7),
      isCollaborative: faker.datatype.boolean(0.2),
      tracks: playlistTracks,
      totalTracks: playlistTracks.length,
      followers: randomNumber(0, 10000),
      createdAt: faker.date.past({ years: 3 }).toISOString(),
    };
  });
};

// Update users with playlists and following
export const updateUsersWithContent = (
  users: User[],
  artists: Artist[],
  playlists: Playlist[]
): User[] => {
  return users.map(user => {
    // Get playlists created by this user
    const userPlaylists = playlists
      .filter(playlist => playlist.ownerId === user.id)
      .map(p => p.id);

    // Make user follow some random artists
    const followedArtists = getRandomItems(artists, randomNumber(5, 15)).map(a => a.id);

    // Make user follow some random users
    const followedUsers = getRandomItems(
      users.filter(u => u.id !== user.id),
      randomNumber(0, 5)
    ).map(u => u.id);

    return {
      ...user,
      playlists: userPlaylists,
      following: {
        artists: followedArtists,
        users: followedUsers,
      },
    };
  });
};

// Generate all mock data
export const generateMockData = () => {
  // Generate base data
  const categories = generateCategories();
  const artists = generateArtists();
  const albums = generateAlbums(artists, 50);
  const tracks = generateTracks(albums);
  const users = generateUsers();
  const playlists = generatePlaylists(users, tracks, 30);

  // Update relationships
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

// Export a singleton instance of the mock data
export const mockData = generateMockData();
