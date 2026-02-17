import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';

describe('Auth Routes', () => {

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not register a user with an existing email', async () => {
        await request(app)
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            });
        const res = await request(app)
            .post('/auth/register')
            .send({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'User already exists or invalid data');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
        // Create a user to login with
        await request(app)
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            });
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should not login with a wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not login a non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nouser@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
  describe('GET /me', () => {
    let token: string;
    beforeEach(async () => {
        await request(app)
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            });
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        token = res.body.token;
    });

    it('should get the current user with a valid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not get the current user without a token', async () => {
        const res = await request(app).get('/auth/me');
        expect(res.statusCode).toEqual(401);
    });

    it('should not get the current user with an invalid token', async () => {
        const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(400);
    });
  });
});
