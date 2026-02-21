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
    token1 = res.body.accessToken;
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

  it('should return 401 without token', async () => {
    const res = await request(app).get('/discovery');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/discovery')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  it('response shape: array of users with id and profile', async () => {
    const res = await request(app)
      .get('/discovery')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((item: unknown) => {
      expect(item).toMatchObject({
        id: expect.any(String),
        profile: expect.any(Object),
      });
    });
  });

  describe('POST /discovery/pass', () => {
    it('should record a pass successfully', async () => {
      const res = await request(app)
        .post('/discovery/pass')
        .set('Authorization', `Bearer ${token1}`)
        .send({ passedUserId: user2.id });
      expect(res.statusCode).toEqual(204);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/discovery/pass')
        .set('Authorization', `Bearer ${token1}`)
        .send({ passedUserId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx' });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
