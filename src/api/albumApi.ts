// 📁 src/api/albumApi.ts
import { faker } from '@faker-js/faker';
import type { Album, Artist } from '../types';
import { generateDurationMs, randomNumber } from '../lib/mocks/utils';

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
      tracks: [],
      type: faker.helpers.arrayElement(['album', 'single', 'EP'] as const),
      totalTracks,
      durationMs: albumDuration
    };
  });
};
