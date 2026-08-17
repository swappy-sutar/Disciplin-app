import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTwoUsers } from '../helpers/authHelper';
import { Topic } from '../../src/models/Topic';

describe('Topics & Curriculum CRUD Module (/api/v1/topics)', () => {
  it('should create a new study topic with subtopics and calculate progressPercent automatically', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/topics')
      .set(authHeader)
      .send({
        title: 'Binary Trees & BST',
        category: 'DSA',
        subTopics: [
          { title: 'Inorder Traversal', isDone: true },
          { title: 'Lowest Common Ancestor', isDone: false },
          { title: 'Serialize & Deserialize BST', isDone: false },
          { title: 'Validate BST', isDone: false },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Binary Trees & BST');
    expect(res.body.data.subTopics.length).toBe(4);
    expect(res.body.data.progressPercent).toBe(25); // 1 out of 4 done = 25%
  });

  it('should reject topic creation if title or category is missing', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/topics')
      .set(authHeader)
      .send({
        category: 'DSA',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should list only the authenticated user topics', async () => {
    const { userA, userB } = await createTwoUsers();

    // User A creates topic
    await request(app)
      .post('/api/v1/topics')
      .set(userA.authHeader)
      .send({
        title: 'Dynamic Programming',
        category: 'DSA',
      });

    // User B creates topic
    await request(app)
      .post('/api/v1/topics')
      .set(userB.authHeader)
      .send({
        title: 'System Design Patterns',
        category: 'Architecture',
      });

    const listRes = await request(app)
      .get('/api/v1/topics')
      .set(userA.authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].title).toBe('Dynamic Programming');
  });

  it('should update topic subtopics and recalculate completion percentage', async () => {
    const { authHeader } = await createTestUser();
    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set(authHeader)
      .send({
        title: 'Redis Caching Patterns',
        category: 'Backend',
        subTopics: [
          { title: 'Cache-Aside', isDone: false },
          { title: 'Write-Through', isDone: false },
        ],
      });
    const topicId = topicRes.body.data._id;
    expect(topicRes.body.data.progressPercent).toBe(0);

    // Update both subtopics to done
    const updateRes = await request(app)
      .patch(`/api/v1/topics/${topicId}`)
      .set(authHeader)
      .send({
        subTopics: [
          { title: 'Cache-Aside', isDone: true },
          { title: 'Write-Through', isDone: true },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.progressPercent).toBe(100);
  });

  it('should enforce multi-tenant authorization on update and delete', async () => {
    const { userA, userB } = await createTwoUsers();

    const topicB = await request(app)
      .post('/api/v1/topics')
      .set(userB.authHeader)
      .send({
        title: 'Kubernetes Pod Security',
        category: 'DevOps',
      });
    const topicBId = topicB.body.data._id;

    // User A tries to update User B's topic
    const updateRes = await request(app)
      .patch(`/api/v1/topics/${topicBId}`)
      .set(userA.authHeader)
      .send({ title: 'Hacked Topic' });

    expect(updateRes.status).toBe(404);

    // User A tries to delete User B's topic
    const deleteRes = await request(app)
      .delete(`/api/v1/topics/${topicBId}`)
      .set(userA.authHeader);

    expect(deleteRes.status).toBe(404);

    const exists = await Topic.findById(topicBId);
    expect(exists).not.toBeNull();
  });
});
