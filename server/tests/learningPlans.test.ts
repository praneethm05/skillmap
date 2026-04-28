import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { aiGenerationService } from '../src/services/aiService';

// Mock the AI Service so we don't actually hit the Ollama local LLM during tests
jest.mock('../src/services/aiService', () => ({
  aiGenerationService: {
    generatePlan: jest.fn()
  }
}));

// Mock Clerk Express SDK
jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req: any, res: any, next: any) => {
    // Inject a dummy auth object to simulate a logged-in user
    req.auth = { userId: 'mock-test-user' };
    next();
  },
  requireAuth: () => (req: any, res: any, next: any) => {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }
}));

describe('Learning Plan Routes', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start In-Memory MongoDB Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    // Teardown
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean DB after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    jest.clearAllMocks();
  });

  describe('POST /api/v1/learning-plans/generate', () => {
    it('should return 400 if topic is missing', async () => {
      const response = await request(app)
        .post('/api/v1/learning-plans/generate')
        .send({ currentLevel: 'beginner' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required parameter: topic');
    });

    it('should generate and save a learning plan successfully', async () => {
      // Setup Mock Response
      const mockDeepSeekResponse = {
        courseName: "Test Course",
        subtopics: [
          {
            title: "Test Topic 1",
            description: "Test Description",
            estimatedHours: 5,
            resources: []
          }
        ]
      };
      
      (aiGenerationService.generatePlan as jest.Mock).mockResolvedValue(mockDeepSeekResponse);

      const response = await request(app)
        .post('/api/v1/learning-plans/generate')
        .send({ topic: 'React Testing' });

      expect(response.status).toBe(201);
      expect(response.body.courseName).toBe('Test Course');
      expect(response.body.totalTopics).toBe(1);
      expect(response.body.estimatedTotalHours).toBe(5);
      expect(response.body.subtopics[0].title).toBe('Test Topic 1');
      expect(aiGenerationService.generatePlan).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'React Testing' })
      );
    });
  });

  describe('GET /api/v1/learning-plans', () => {
    it('should return an empty array if user has no plans', async () => {
      const response = await request(app).get('/api/v1/learning-plans');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});