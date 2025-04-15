// 📁 src/api/playlistApi.ts
import { faker } from '@faker-js/faker';
import type { Playlist, User, Track } from '../types';
import { getRandomItems, randomNumber } from '../lib/mocks/utils';

export const generatePlaylists = (users: User[], tracks: Track[], count = 15): Playlist[] => {
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
