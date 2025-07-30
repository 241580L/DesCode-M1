const request = require('supertest');
const app = require('../index'); // Your Express app
const db = require('../models');
const jwt = require('jsonwebtoken');

describe('Admin Features', () => {
    let adminToken;
    let userId;
    let testReviewId = 0;
    const uniqueEmail = `newuser${Date.now()}@example.com`;

    beforeAll(async () => {
        // Create an admin user in DB or mock
        // Below code does not work because user is fictional (does not exist in DB)
        // const adminUser = { id: 1, email: 'usernam@example.com', name: 'Username', isAdmin: true };
        const [adminUser, created] = await db.User.findOrCreate({
            where: { id: 5 },
            defaults: {
                id: 5,
                name: 'Testy McTestington',
                email: 'tester@example.com',
                password: '$2b$10$Lo2X.nE1iRYh7Di/GNsgv..p7ITVXrNddfjYlXJb/4duUFS7x3bVi', // hashed password
                isAdmin: true,
                deleted: false,
            },
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

        // Now create the test review, setting reviewerId to adminUser.id
        await db.Review.findOrCreate({
            where: { id: testReviewId },
            defaults: {
                title: 'Test Review',
                description: 'Test Description',
                stars: 5,
                reviewerId: adminUser.id,  // <-- Provide valid reviewerId here
                deleted: false,
                postDateTime: new Date(),
            }
        });

    });

    afterAll(async () => {
        // Cleanup test data
        // await db.User.destroy({ where: { email: 'newuser@example.com' } });
        // await db.User.destroy({ where: { email: 'admin@example.com' } });
        try {
            if (userId) {
                // Example: Soft delete a user by setting deleted = true
                await db.User.update({ deleted: true }, { where: { id: userId } });
            }
            // Example: Soft delete a review by setting deleted = true
            await db.Review.update({ deleted: true }, { where: { id: testReviewId } });
        } catch (err) {
            console.error("Error during afterAll cleanup:", err);
        }
        // Close DB connection if necessary
        await db.sequelize.close();
    });

    test('Admin can create a new user', async () => {
        const res = await request(app)
            .post('/user/register')
            .send({
                name: 'New User',
                email: uniqueEmail,
                password: 'Password12345678'
            })
            .set('Authorization', `Bearer ${adminToken}`);

        if (res.statusCode !== 200) {
            console.error('Create user failed:', res.body);
        }

        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe(uniqueEmail);
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
        // Below code does not work because user is fictional
        // const user = { id: 2, email: 'usernam2@example.com', name: 'User Two', isAdmin: false };
        const user = await db.User.findByPk(6);

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

        // await user.destroy(); // Don't.
    });
});
