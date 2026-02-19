import request from 'supertest';
import { app } from '../server';
import { expectLoginResponseShape, expectRegisterResponseShape, expectAuthMeResponseShape, expectErrorShape } from './testContracts';

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
      expectRegisterResponseShape(res.body);
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for invalid register body (missing email)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ password: 'password123', firstName: 'T', lastName: 'U' });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
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
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('error', 'Resource already exists');
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
      expectLoginResponseShape(res.body);
    });

    it('should return 400 for invalid login body (missing email)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
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
        token = res.body.accessToken;
    });

    it('should get the current user with a valid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expectAuthMeResponseShape(res.body);
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
        expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: 'refresh@example.com', password: 'password123', firstName: 'R', lastName: 'U' });
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'refresh@example.com', password: 'password123' });
      const { refreshToken } = loginRes.body;
      const res = await request(app).post('/auth/refresh').send({ refreshToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('refresh@example.com');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid' });
      expect(res.statusCode).toEqual(401);
      expectErrorShape(res.body);
    });

    it('should return 400 when refresh token is missing in body', async () => {
      const res = await request(app).post('/auth/refresh').send({});
      expect(res.statusCode).toEqual(400);
      expectErrorShape(res.body);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 204 with or without body', async () => {
      const res = await request(app).post('/auth/logout').send({});
      expect(res.statusCode).toEqual(204);
    });
  });
});
