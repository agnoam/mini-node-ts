import { ServerBoot } from '../src/server';

import { Application } from 'express';
import request, { Response } from 'supertest';

describe('Routes tests', () => {
    let app: Application;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = await ServerBoot.listen();
        
        console.log('beforeAll:', app);
    });

    afterAll(() => {
        ServerBoot.server.close();
        console.log('Closing server');
    });

    test('Always true test', () => {
        const firstDate: number = Date.now();
        setTimeout(() => {
            const secondDate: number = Date.now();
            expect(secondDate).toBeGreaterThan(firstDate);
        }, 1);
    });

    test('Request mocking test', async () => {
        const res: Response = await request(app).get('/users/test');
        console.log(res.body);
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('date');
    });
});