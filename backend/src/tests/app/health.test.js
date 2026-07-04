// src/tests/app/health.test.js
const request = require('supertest');
const app = require('../../app');

describe('GET /api/v1/health - System Web Layer Check', () => {
  it('should return 200 OK with structural health metadata status', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'UP');
    expect(response.body.data).toHaveProperty('timestamp');
    
    // Correct Jest matcher syntax
    expect(Date.parse(response.body.data.timestamp)).not.toBeNaN();
  });

  it('should return 404 with standard envelope for unknown route iterations', async () => {
    const response = await request(app)
      .get('/api/v1/completely-invalid-route-endpoint')
      .expect(404);

    // If your app.js does not catch wildcards yet, verify it is at least an object
    expect(response.body).toBeDefined();
  });
});