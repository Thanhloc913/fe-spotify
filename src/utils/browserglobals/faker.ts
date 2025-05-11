import { faker } from "@faker-js/faker";
import { Genre, Playlist, Profile, Role, User } from "../../types";

const generateProfile = (): Profile => ({
  id: faker.string.uuid(),
  accountID: faker.string.uuid(),
  fullName: faker.person.fullName(),
  avatarUrl: faker.image.avatar(),
  bio: faker.lorem.paragraph(),
  dateOfBirth: faker.date.birthdate().toISOString().split("T")[0],
  phoneNumber: faker.phone.number(),
});

export const getProfile = generateProfile;
export const getProfiles = (count: number = 10): Profile[] =>
  Array.from({ length: count }, generateProfile);

const generateUser = (): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  profileImageUrl: faker.image.avatar(),
  following: {
    artists: Array.from({ length: 3 }, () => faker.string.uuid()),
    users: Array.from({ length: 5 }, () => faker.string.uuid()),
  },
  playlists: Array.from({ length: 2 }, () => faker.string.uuid()),
  createdAt: faker.date.past().toISOString(),
});

export const getUser = generateUser;
export const getUsers = (count: number = 10): User[] =>
  Array.from({ length: count }, generateUser);

// Custom genre names (since faker doesn't have music genre-specific data)
const MUSIC_GENRES = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "R&B",
  "Country",
  "Metal",
  "Folk",
  "Reggae",
  "Punk",
  "Blues",
  "Soul",
  "Funk",
  "Disco",
  "House",
  "Techno",
  "Indie",
  "Alternative",
  "Gospel",
  "K-Pop",
  "J-Pop",
  "Latin",
];

// Generate a single Genre
const generateGenre = (): Genre => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(MUSIC_GENRES),
  description: faker.lorem.sentence(),
});

export const getGenre = generateGenre;
export const getGenres = (count: number = 10): Genre[] =>
  Array.from({ length: count }, generateGenre);

// Custom role codes (single word)
const ROLE_CODES = [
  "admin",
  "artist",
  "listener",
  "moderator",
  "producer",
  "editor",
  "curator",
  "analyst",
  "supporter",
  "vip",
];

// Generate a single Role
const generateRole = (): Role => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(ROLE_CODES),
  description: faker.lorem.sentence(),
});
export const getRole = generateRole;
export const getRoles = (count: number = 10): Role[] =>
  Array.from({ length: count }, generateRole);

const generatePlaylist = (): Playlist => {
  const totalTracks = faker.number.int({ min: 5, max: 30 });
  return {
    id: faker.string.uuid(),
    name: faker.music.songName(),
    description: faker.lorem.sentence(),
    coverUrl: faker.image.urlLoremFlickr({ category: "music" }),
    ownerId: faker.string.uuid(),
    ownerName: faker.person.fullName(),
    isPublic: faker.datatype.boolean(),
    isCollaborative: faker.datatype.boolean(),
    tracks: Array.from({ length: totalTracks }, () => faker.string.uuid()),
    totalTracks,
    followers: faker.number.int({ min: 0, max: 10000 }),
    createdAt: faker.date.past().toISOString(),
  };
};

export const getPlaylist = generatePlaylist;
export const getPlaylists = (count: number = 10): Playlist[] =>
  Array.from({ length: count }, generatePlaylist);
