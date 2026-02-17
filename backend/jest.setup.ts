import { prisma } from './src/db';

beforeEach(async () => {
  // It's crucial to use a transaction to ensure all deletes happen or none do.
  await prisma.$transaction([
    prisma.message.deleteMany({}),
    prisma.match.deleteMany({}),
    prisma.profile.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
