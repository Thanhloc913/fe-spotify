import { faker } from "@faker-js/faker";
import { Profile, User } from "../../types";

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
