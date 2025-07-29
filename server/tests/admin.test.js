const request = require('supertest');
const app = require('../index'); // Your Express app
const db = require('../models');
const jwt = require('jsonwebtoken');

describe('Admin Features', () => {
  let adminToken;
  let userId;

  beforeAll(async () => {
    // Create an admin user in DB or mock
    const adminUser = { id: 1, email: 'testuser@example.com', name: 'Test User', isAdmin: true };
    /*
    const adminUser = await db.User.create({
      name: 'Username',
      email: 'username@example.com',
      password: '$2b$10$Lo2X.nE1iRYh7Di/GNsgv..p7ITVXrNddfjYlXJb/4duUFS7x3bVi', // assume already hashed or mock validation
      isAdmin: true,
    });*/

  afterAll(async () => {
    // Cleanup test data
    // await db.User.destroy({ where: { email: 'newuser@example.com' } });
    // await db.User.destroy({ where: { email: 'admin@example.com' } });
    await db.sequelize.close();
  });
  
    // Generate JWT token (should match your secret and expiresIn)
    adminToken = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
      },
      process.env.APP_SECRET,
      { expiresIn: '1h' }
    );
  });

  test('Admin can create a new user', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password1',
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('newuser@example.com');
    userId = res.body.user.id;
  });

  test('Admin can update a user', async () => {
    const res = await request(app)
      .put(`/user/${userId}`)
      .send({ name: 'Updated User', isAdmin: false })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Updated User');
  });

  test('Admin can delete a user', async () => {
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test('Non-admin user cannot access admin routes', async () => {
    // Create a non-admin user token
    const user = { id: 2, email: 'testuser2@example.com', name: 'Test User', isAdmin: False };

    const userToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      process.env.APP_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/user') // assuming this route lists users, admin only
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);

    // await user.destroy();
  });
});
