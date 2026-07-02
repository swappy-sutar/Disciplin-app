"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
(0, vitest_1.describe)('Timetable Endpoints', () => {
    const testUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
    };
    const getCookie = async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(testUser);
        return res.headers['set-cookie'];
    };
    (0, vitest_1.it)('should create and fetch timetable blocks', async () => {
        const cookie = await getCookie();
        const blockData = {
            date: '2026-07-02',
            startTime: '08:00',
            endTime: '09:00',
            label: 'Morning Run',
            tag: 'Health',
            order: 1,
        };
        const createRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/timetable')
            .set('Cookie', cookie)
            .send(blockData);
        (0, vitest_1.expect)(createRes.status).toBe(201);
        (0, vitest_1.expect)(createRes.body.success).toBe(true);
        (0, vitest_1.expect)(createRes.body.data.label).toBe(blockData.label);
        const fetchRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/timetable?date=2026-07-02')
            .set('Cookie', cookie);
        (0, vitest_1.expect)(fetchRes.status).toBe(200);
        (0, vitest_1.expect)(fetchRes.body.success).toBe(true);
        (0, vitest_1.expect)(fetchRes.body.data.length).toBe(1);
        (0, vitest_1.expect)(fetchRes.body.data[0].label).toBe(blockData.label);
    });
    (0, vitest_1.it)('should update and delete timetable blocks', async () => {
        const cookie = await getCookie();
        const createRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/timetable')
            .set('Cookie', cookie)
            .send({
            date: '2026-07-02',
            startTime: '09:00',
            endTime: '10:00',
            label: 'Study TypeScript',
            tag: 'Study',
        });
        const blockId = createRes.body.data._id;
        const updateRes = await (0, supertest_1.default)(app_1.default)
            .patch(`/api/v1/timetable/${blockId}`)
            .set('Cookie', cookie)
            .send({ isDone: true, label: 'Study TypeScript Deeply' });
        (0, vitest_1.expect)(updateRes.status).toBe(200);
        (0, vitest_1.expect)(updateRes.body.data.isDone).toBe(true);
        (0, vitest_1.expect)(updateRes.body.data.label).toBe('Study TypeScript Deeply');
        const deleteRes = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/timetable/${blockId}`)
            .set('Cookie', cookie);
        (0, vitest_1.expect)(deleteRes.status).toBe(200);
        const fetchRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/timetable?date=2026-07-02')
            .set('Cookie', cookie);
        (0, vitest_1.expect)(fetchRes.body.data.length).toBe(0);
    });
    (0, vitest_1.it)('should copy timetable blocks from source to target date', async () => {
        const cookie = await getCookie();
        await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/timetable')
            .set('Cookie', cookie)
            .send({
            date: '2026-07-02',
            startTime: '10:00',
            endTime: '11:00',
            label: 'Build Project',
            tag: 'Work',
        });
        const copyRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/timetable/template')
            .set('Cookie', cookie)
            .send({
            sourceDate: '2026-07-02',
            targetDate: '2026-07-03',
        });
        (0, vitest_1.expect)(copyRes.status).toBe(200);
        (0, vitest_1.expect)(copyRes.body.success).toBe(true);
        const targetRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/timetable?date=2026-07-03')
            .set('Cookie', cookie);
        (0, vitest_1.expect)(targetRes.body.data.length).toBe(1);
        (0, vitest_1.expect)(targetRes.body.data[0].label).toBe('Build Project');
        (0, vitest_1.expect)(targetRes.body.data[0].date).toBe('2026-07-03');
        (0, vitest_1.expect)(targetRes.body.data[0].isDone).toBe(false);
    });
});
