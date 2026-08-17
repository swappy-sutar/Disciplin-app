import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTwoUsers } from './helpers/authHelper';

describe('Interview Prep Module', () => {
  it('should verify CRUD on prep module & ownership authorization (403)', async () => {
    const { userA, userB } = await createTwoUsers();
    const tokenA = userA.token;
    const tokenB = userB.token;

    // 1. Create a Topic for User A
    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Node.js Core',
        category: 'Backend',
        subTopics: [{ title: 'Event Loop' }],
      });

    expect(topicRes.status).toBe(201);
    const topicId = topicRes.body.data._id;

    // 2. User B tries to post a note to User A's topic -> returns 403
    const forbiddenRes = await request(app)
      .post(`/api/v1/topics/${topicId}/notes`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        title: 'Unauthorized Note',
        bodyMarkdown: 'This note is unauthorized',
      });
    expect(forbiddenRes.status).toBe(403);

    // 3. User A successfully posts a note
    const noteRes = await request(app)
      .post(`/api/v1/topics/${topicId}/notes`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Event Loop Deep Dive',
        bodyMarkdown: 'The loop has phases...',
        tags: ['architecture'],
      });
    expect(noteRes.status).toBe(201);
    const noteId = noteRes.body.data._id;

    // 4. User B tries to update User A's note -> returns 403
    const forbiddenUpdateRes = await request(app)
      .patch(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked Title' });
    expect(forbiddenUpdateRes.status).toBe(403);

    // 5. User A updates the note successfully
    const updateRes = await request(app)
      .patch(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Event Loop Mastery' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Event Loop Mastery');

    // 6. User A posts a QA item and a Coding question
    const qaRes = await request(app)
      .post(`/api/v1/topics/${topicId}/qa`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        question: 'What is process.nextTick?',
        answerMarkdown: 'It schedules a callback...',
        frequency: 'common',
        confidence: 'weak',
      });
    expect(qaRes.status).toBe(201);
    const qaId = qaRes.body.data._id;

    const codingRes = await request(app)
      .post(`/api/v1/topics/${topicId}/coding`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Reverse Linked List',
        problemMarkdown: 'Given a list...',
        solutionCode: 'function reverse() {}',
        solutionLanguage: 'typescript',
        difficulty: 'easy',
        confidence: 'weak',
      });
    expect(codingRes.status).toBe(201);
    const codingId = codingRes.body.data._id;

    // 7. Get topic detail aggregate for User A
    const detailRes = await request(app)
      .get(`/api/v1/topics/${topicId}/detail`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.topic.title).toBe('Node.js Core');
    expect(detailRes.body.data.notes.length).toBe(1);
    expect(detailRes.body.data.qaItems.length).toBe(1);
    expect(detailRes.body.data.codingQuestions.length).toBe(1);

    // User B tries to fetch User A's detail -> returns 403
    const forbiddenDetailRes = await request(app)
      .get(`/api/v1/topics/${topicId}/detail`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(forbiddenDetailRes.status).toBe(403);

    // 8. Get review lists
    // Post one more ok/strong QAItem to test filtering
    await request(app)
      .post(`/api/v1/topics/${topicId}/qa`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        question: 'What is setImmediate?',
        answerMarkdown: 'Runs check phase...',
        frequency: 'occasional',
        confidence: 'strong',
      });

    // Review all
    const reviewAllRes = await request(app)
      .get(`/api/v1/topics/${topicId}/review`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(reviewAllRes.status).toBe(200);
    // Combined list: 2 QA + 1 Coding = 3 items
    expect(reviewAllRes.body.data.length).toBe(3);
    const types = reviewAllRes.body.data.map((item: any) => item.type);
    expect(types).toContain('qa');
    expect(types).toContain('coding');

    // Review weak only
    const reviewWeakRes = await request(app)
      .get(`/api/v1/topics/${topicId}/review?filter=weak`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(reviewWeakRes.status).toBe(200);
    // Filtered list: 1 QA (weak) + 1 Coding (weak) = 2 items
    expect(reviewWeakRes.body.data.length).toBe(2);
    reviewWeakRes.body.data.forEach((item: any) => {
      expect(item.confidence).toBe('weak');
    });

    // 9. Clean up / delete note
    const deleteRes = await request(app)
      .delete(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteRes.status).toBe(200);
  }, 30000);
});
