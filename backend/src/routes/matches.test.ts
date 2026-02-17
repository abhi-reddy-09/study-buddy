import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';
import { User, Match } from '@prisma/client';
import bcrypt from 'bcrypt';

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
    token1 = res1.body.token;
    const res2 = await request(app).post('/auth/login').send({ email: 'match2@example.com', password: 'password123' });
    token2 = res2.body.token;
  });

  describe('POST /matches', () => {
    it('should initiate a match successfully', async () => {
      const res = await request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ receiverId: user2.id });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.initiatorId).toBe(user1.id);
      expect(res.body.receiverId).toBe(user2.id);
      expect(res.body.status).toBe('PENDING');
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
      expect(res.body[0].id).toBe(match.id);
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
