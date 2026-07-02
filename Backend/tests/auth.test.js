"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
(0, vitest_1.describe)('Auth Endpoints', () => {
    const testUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };
    (0, vitest_1.it)('should register a new user and set cookie', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/register')
            .send(testUser);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.name).toBe(testUser.name);
        (0, vitest_1.expect)(res.body.data.email).toBe(testUser.email);
        (0, vitest_1.expect)(res.body.data).not.toHaveProperty('passwordHash');
        const cookies = res.headers['set-cookie'];
        (0, vitest_1.expect)(cookies).toBeDefined();
        (0, vitest_1.expect)(cookies[0]).toContain('jwt=');
    });
    (0, vitest_1.it)('should not register user with duplicate email', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(testUser);
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(testUser);
        (0, vitest_1.expect)(res.status).toBe(409);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
    (0, vitest_1.it)('should login an existing user', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(testUser);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password,
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.email).toBe(testUser.email);
    });
    (0, vitest_1.it)('should fetch the profile of the logged-in user', async () => {
        const regRes = await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(testUser);
        const cookie = regRes.headers['set-cookie'];
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/auth/me')
            .set('Cookie', cookie);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.email).toBe(testUser.email);
    });
});
