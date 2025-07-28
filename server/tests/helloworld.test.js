const request = require('supertest');
const app = require('../index');

describe('GET /', () => {
    test('should return 200 OK', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        console.log("Hello World!");
    });
});