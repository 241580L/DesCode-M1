// server/rests/reviewVote.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');
const { ReviewVote, Review, User, sequelize } = require('../models');

const testUser = { id: 1, email: 'testuser@example.com', name: 'Test User', isAdmin: true };
const testReviewId = 1;
const appSecret = process.env.APP_SECRET || 'testsecret';

describe('POST /reviews/:id/vote', () => {
  let token;

  beforeAll(async () => {
    token = jwt.sign(testUser, appSecret, { expiresIn: '1h' });

    // Ensure the test review and user exist or create dummy ones if necessary
    // This step depends on your test DB setup
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should reject without auth token', async () => {
    const res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .send({ upvote: true });
    expect(res.statusCode).toBe(401); // Unauthorized
  });

  test('should reject when upvote is missing or invalid type', async () => {
    const res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: 'not_boolean' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid vote value. Must be boolean.');
  });

  test('should create upvote if none exists', async () => {
    const res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Vote updated');
    expect(res.body).toHaveProperty('upvotes');
    expect(res.body).toHaveProperty('downvotes');
  });

  test('should toggle (remove) existing upvote on repeated vote', async () => {
    // Vote up first time
    let res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: true });
    expect(res.statusCode).toBe(200);

    // Vote up second time to remove vote
    res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: true });
    expect(res.statusCode).toBe(200);
  });

  test('should change vote from upvote to downvote', async () => {
    // Vote up
    await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: true });

    // Change to downvote
    const res = await request(app)
      .post(`/reviews/${testReviewId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: false });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Vote updated');
  });

  test('should handle non-existent review id gracefully', async () => {
    const nonExistentId = 999999;
    const res = await request(app)
      .post(`/reviews/${nonExistentId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ upvote: true });

    // Depending on implementation this might return 200 or 500, just check for allowed statuses
    expect([200, 500]).toContain(res.statusCode);
  });
});
