import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';
import bcrypt from 'bcrypt';
import { expectErrorShape } from './testContracts';

describe('Profile Routes', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Create a user and log in to get a token
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'profile-test@example.com',
        password: hashedPassword,
        profile: {
          create: {
            firstName: 'Profile',
            lastName: 'User',
          },
        },
      },
      include: {
        profile: true,
      },
    });
    userId = user.id;

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'profile-test@example.com',
        password: 'password123',
      });
    token = res.body.accessToken;
  });

  describe('PUT /profile', () => {
    it('should update a user profile successfully', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          major: 'Computer Science',
          bio: 'I love coding!',
          studyHabits: 'Early bird',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Profile%20User',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.major).toBe('Computer Science');
      expect(res.body.bio).toBe('I love coding!');
      expect(res.body.studyHabits).toBe('Early bird');
      expect(res.body.avatarUrl).toBe('https://api.dicebear.com/7.x/initials/svg?seed=Profile%20User');
    });

    it('should not update a profile with an invalid token', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .send({
          major: 'History',
        });
      expect(res.statusCode).toEqual(401);
    });

    it('should not update a profile without a token', async () => {
      const res = await request(app)
        .put('/profile')
        .send({
          major: 'History',
        });
      expect(res.statusCode).toEqual(401);
      expectErrorShape(res.body);
    });

    it('should return 400 for validation error (major exceeds max length)', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          major: 'x'.repeat(201),
        });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });

    it('should return 400 for invalid avatar url', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatarUrl: 'not-a-url',
        });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });

    it('should return 400 when avatar url is too long', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${'a'.repeat(600)}`,
        });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });
  });
});
