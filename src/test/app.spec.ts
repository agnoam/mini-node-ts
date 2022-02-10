import request, { Response } from 'supertest';
import { ServerBoot } from './../server';

let app: any;

describe('Routes tests', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = ServerBoot.app;
    });

    test('Always true test', () => {
        const firstDate: number = Date.now();
        setTimeout(() => {
            const secondDate: number = Date.now();
            expect(secondDate).toBeGreaterThan(firstDate);
        }, 1);
    });

    test('Request mocking test', async () => {
        const res: Response = await request(app).get('/');
        expect(res.body).toHaveProperty('description', 'date');
    });
});