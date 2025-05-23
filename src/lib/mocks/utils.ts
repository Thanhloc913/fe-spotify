//src/lib/mocks/utils.ts
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateDurationMs = (): number => {
  return randomNumber(120000, 300000);
};
