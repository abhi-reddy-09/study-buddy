import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';
import { User, Match } from '@prisma/client';
import bcrypt from 'bcrypt';
import { expectMatchItemShape, expectErrorShape } from './testContracts';

describe('Matches Routes', () => {
  let user1: User;
  let user2: User;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    // Create two users and log them in
    const hashedPassword = await bcrypt.hash('password123', 10);
    user1 = await prisma.user.create({
      data: {
        email: 'match1@example.com',
        password: hashedPassword,
        profile: { create: { firstName: 'Match', lastName: 'One' } },
      },
    });
    user2 = await prisma.user.create({
      data: {
        email: 'match2@example.com',
        password: hashedPassword,
        profile: { create: { firstName: 'Match', lastName: 'Two' } },
      },
    });
    const res1 = await request(app).post('/auth/login').send({ email: 'match1@example.com', password: 'password123' });
    token1 = res1.body.accessToken;
    const res2 = await request(app).post('/auth/login').send({ email: 'match2@example.com', password: 'password123' });
    token2 = res2.body.accessToken;
  });

  describe('POST /matches', () => {
    it('should initiate a match successfully', async () => {
      const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });

      expect(res.statusCode).toEqual(201);
      expectMatchItemShape(res.body);
      expect(res.body.initiatorId).toBe(user1.id);
      expect(res.body.receiverId).toBe(user2.id);
      expect(res.body.status).toBe('PENDING');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/matches')
        .send({ receiverId: user2.id });
      expect(res.statusCode).toEqual(401);
      expectErrorShape(res.body);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/matches')
        .set('Authorization', 'Bearer invalidtoken')
        .send({ receiverId: user2.id });
      expect(res.statusCode).toEqual(401);
      expectErrorShape(res.body);
    });

    it('should return 400 when receiverId is missing', async () => {
      const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({});
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });

    it('should return 400 when receiverId is not a valid cuid', async () => {
      const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: 'not-a-cuid' });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });

    it('should not allow a user to match with themselves', async () => {
        const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user1.id });
      
      expect(res.statusCode).toEqual(400);
    });

    it('should not allow creating a duplicate match', async () => {
        await prisma.match.create({ data: { initiatorId: user1.id, receiverId: user2.id } });
        const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });
      
      expect(res.statusCode).toEqual(400);
    });

    it('should allow re-initiation when previous match was rejected', async () => {
      const match = await prisma.match.create({
        data: { initiatorId: user1.id, receiverId: user2.id, status: 'REJECTED' },
      });
      const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });

      expect(res.statusCode).toEqual(201);
      expect(res.body.id).toBe(match.id);
      expect(res.body.status).toBe('PENDING');
      const updated = await prisma.match.findUnique({ where: { id: match.id } });
      expect(updated?.status).toBe('PENDING');
    });
  });

  describe('GET /matches', () => {
    it("should get a user's matches", async () => {
      const match = await prisma.match.create({ data: { initiatorId: user1.id, receiverId: user2.id } });
      const res = await request(app)
        .get('/matches')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expectMatchItemShape(res.body[0]);
      expect(res.body[0].id).toBe(match.id);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/matches');
      expect(res.statusCode).toEqual(401);
      expectErrorShape(res.body);
    });
  });

  describe('PUT /matches/:id/accept', () => {
    let match: Match;
    beforeEach(async () => {
      match = await prisma.match.create({ data: { initiatorId: user1.id, receiverId: user2.id } });
    });

    it('should allow the receiver to accept a match', async () => {
      const res = await request(app)
        .put(`/matches/${match.id}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('ACCEPTED');
    });

    it('should not allow the initiator to accept a match', async () => {
        const res = await request(app)
        .put(`/matches/${match.id}/accept`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should not allow accepting a match that is not pending', async () => {
        await prisma.match.update({ where: { id: match.id }, data: { status: 'ACCEPTED' } });
        const res = await request(app)
        .put(`/matches/${match.id}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should return 404 for a non-existent match id', async () => {
        const res = await request(app)
        .put(`/matches/non-existent-id/accept`)
        .set('Authorization', `Bearer ${token2}`);

        expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /matches/:id/reject', () => {
    let match: Match;
    beforeEach(async () => {
      match = await prisma.match.create({ data: { initiatorId: user1.id, receiverId: user2.id } });
    });

    it('should allow the receiver to reject a match', async () => {
      const res = await request(app)
        .put(`/matches/${match.id}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('REJECTED');
    });

    it('should not allow the initiator to reject a match', async () => {
        const res = await request(app)
        .put(`/matches/${match.id}/reject`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(403);
    });
    
    it('should not allow rejecting a match that is not pending', async () => {
        await prisma.match.update({ where: { id: match.id }, data: { status: 'ACCEPTED' } });
        const res = await request(app)
        .put(`/matches/${match.id}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should return 404 for a non-existent match id', async () => {
        const res = await request(app)
        .put(`/matches/non-existent-id/reject`)
        .set('Authorization', `Bearer ${token2}`);

        expect(res.statusCode).toEqual(404);
    });
  });
});
