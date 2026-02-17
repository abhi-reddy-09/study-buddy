import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('Discovery Routes', () => {
  let user1: User;
  let user2: User;
  let token1: string;

  beforeEach(async () => {
    // Create two users
    const hashedPassword = await bcrypt.hash('password123', 10);
    user1 = await prisma.user.create({
      data: {
        email: 'discovery1@example.com',
        password: hashedPassword,
        profile: { create: { firstName: 'Discovery', lastName: 'One' } },
      },
    });
    user2 = await prisma.user.create({
      data: {
        email: 'discovery2@example.com',
        password: hashedPassword,
        profile: { create: { firstName: 'Discovery', lastName: 'Two' } },
      },
    });

    // Log in as user1 to get a token
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'discovery1@example.com', password: 'password123' });
    token1 = res.body.token;
  });

  it('should return users that are not the logged-in user', async () => {
    const res = await request(app)
      .get('/discovery')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(user2.id);
  });

  it('should not return users that are already matched', async () => {
    // Create a match between user1 and user2
    await prisma.match.create({
      data: {
        initiatorId: user1.id,
        receiverId: user2.id,
      },
    });

    const res = await request(app)
      .get('/discovery')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });
});
