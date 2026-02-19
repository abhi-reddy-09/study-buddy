import { prisma } from './src/db';

jest.setTimeout(30000);

beforeEach(async () => {
  await prisma.message.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});
