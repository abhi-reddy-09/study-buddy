import { prisma } from './src/db';

jest.setTimeout(30000);

const shouldCleanDatabase = process.env.CLEAN_TEST_DATABASE === 'true';

if (shouldCleanDatabase) {
  beforeEach(async () => {
    await prisma.message.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.pass.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
  });
}

afterAll(async () => {
  await prisma.$disconnect();
});
