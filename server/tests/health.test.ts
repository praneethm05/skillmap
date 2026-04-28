import request from 'supertest';
import app from '../src/app';

describe('Infrastructure Routes', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with correct status payload', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'SkillMap API is running'
      });
    });
  });
});