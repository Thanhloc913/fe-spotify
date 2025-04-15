// 📁 src/api/categoryApi.ts
import { faker } from '@faker-js/faker';
import type { Category } from '../types';

export const generateCategories = (count = 10): Category[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.music.genre(),
    imageUrl: faker.image.urlLoremFlickr({ category: 'music', width: 300, height: 300 }),
    description: faker.lorem.sentence(),
  }));
};