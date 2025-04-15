// 📁 src/api/userApi.ts
import { faker } from '@faker-js/faker';
import type { User, Artist, Playlist } from '../types';
import { getRandomItems, randomNumber } from '../lib/mocks/utils';

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

export const updateUsersWithContent = (users: User[], artists: Artist[], playlists: Playlist[]): User[] => {
  return users.map(user => {
    const userPlaylists = playlists.filter(p => p.ownerId === user.id).map(p => p.id);
    const followedArtists = getRandomItems(artists, randomNumber(5, 15)).map(a => a.id);
    const followedUsers = getRandomItems(users.filter(u => u.id !== user.id), randomNumber(0, 5)).map(u => u.id);

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
