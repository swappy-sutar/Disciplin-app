import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/authHelper';

describe('Timetable Endpoints', () => {
  const getToken = async () => {
    const { token } = await createTestUser();
    return token;
  };

  it('should create and fetch timetable blocks', async () => {
    const token = await getToken();

    const blockData = {
      date: '2026-07-02',
      startTime: '08:00',
      endTime: '09:00',
      label: 'Morning Run',
      tag: 'Health',
      order: 1,
    };

    const createRes = await request(app)
      .post('/api/v1/timetable')
      .set('Authorization', `Bearer ${token}`)
      .send(blockData);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.label).toBe(blockData.label);

    const fetchRes = await request(app)
      .get('/api/v1/timetable?date=2026-07-02')
      .set('Authorization', `Bearer ${token}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.success).toBe(true);
    expect(fetchRes.body.data.length).toBe(1);
    expect(fetchRes.body.data[0].label).toBe(blockData.label);
  });

  it('should update and delete timetable blocks', async () => {
    const token = await getToken();

    const createRes = await request(app)
      .post('/api/v1/timetable')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-07-02',
        startTime: '09:00',
        endTime: '10:00',
        label: 'Study TypeScript',
        tag: 'Study',
      });

    const blockId = createRes.body.data._id;

    const updateRes = await request(app)
      .patch(`/api/v1/timetable/${blockId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isDone: true, label: 'Study TypeScript Deeply' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.isDone).toBe(true);
    expect(updateRes.body.data.label).toBe('Study TypeScript Deeply');

    const deleteRes = await request(app)
      .delete(`/api/v1/timetable/${blockId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const fetchRes = await request(app)
      .get('/api/v1/timetable?date=2026-07-02')
      .set('Authorization', `Bearer ${token}`);
    expect(fetchRes.body.data.length).toBe(0);
  });

  it('should copy timetable blocks from source to target date', async () => {
    const token = await getToken();

    await request(app)
      .post('/api/v1/timetable')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-07-02',
        startTime: '10:00',
        endTime: '11:00',
        label: 'Build Project',
        tag: 'Work',
      });

    const copyRes = await request(app)
      .post('/api/v1/timetable/template')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sourceDate: '2026-07-02',
        targetDate: '2026-07-03',
      });

    expect(copyRes.status).toBe(200);
    expect(copyRes.body.success).toBe(true);

    const targetRes = await request(app)
      .get('/api/v1/timetable?date=2026-07-03')
      .set('Authorization', `Bearer ${token}`);

    expect(targetRes.body.data.length).toBe(1);
    expect(targetRes.body.data[0].label).toBe('Build Project');
    expect(targetRes.body.data[0].date).toBe('2026-07-03');
    expect(targetRes.body.data[0].isDone).toBe(false);
  });
});
