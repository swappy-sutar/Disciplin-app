"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
(0, vitest_1.beforeAll)(async () => {
    const testUri = process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/\/([^/]+)$/, '/disciplin-app-test')
        : 'mongodb://127.0.0.1:27017/disciplin-app-test';
    if (mongoose_1.default.connection.readyState === 0) {
        await mongoose_1.default.connect(testUri);
    }
});
(0, vitest_1.beforeEach)(async () => {
    if (mongoose_1.default.connection.readyState > 0) {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});
(0, vitest_1.afterAll)(async () => {
    if (mongoose_1.default.connection.readyState > 0) {
        await mongoose_1.default.disconnect();
    }
});
