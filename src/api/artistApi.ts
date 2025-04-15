//  src/api/artistApi.ts
import { faker } from '@faker-js/faker';
import type { Artist, Album, Track } from '../types';
import { getRandomItems, randomNumber } from '../lib/mocks/utils';

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

export const updateArtistsWithContent = (artists: Artist[], albums: Album[], tracks: Track[]): Artist[] => {
  return artists.map(artist => {
    const artistAlbums = albums.filter(album => album.artistId === artist.id);
    const artistTracks = tracks.filter(track => track.artistId === artist.id);
    const topTracks = getRandomItems(artistTracks, Math.min(5, artistTracks.length)).map(t => t.id);
    const singles = artistAlbums.filter(album => album.type === 'single').map(album => album.id);
    const artistFullAlbums = artistAlbums.filter(album => album.type === 'album').map(album => album.id);
    const related = getRandomItems(artists.filter(a => a.id !== artist.id), randomNumber(3, 5)).map(a => a.id);

    return {
      ...artist,
      albums: artistFullAlbums,
      singles,
      topTracks,
      related,
    };
  });
};
