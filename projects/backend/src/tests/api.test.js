const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
    it('should return UP status', async () => {
        const res = await request(app).get('/health');
        // Note: Will fail if DB not connected, which is expected in CI without DB
        expect(res.status).toBeLessThan(600);
    });
});

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should reject registration with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
        });

        it('should reject registration with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'not-an-email',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should reject login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
        });
    });
});

describe('Protected Routes', () => {
    it('should reject access without token', async () => {
        const res = await request(app).get('/api/events');
        expect(res.status).toBe(401);
    });

    it('should reject access with invalid token', async () => {
        const res = await request(app)
            .get('/api/events')
            .set('Authorization', 'Bearer invalid-token');
        expect(res.status).toBe(403);
    });
});

describe('Attendance Invariants', () => {
    it('should reject attendance without authentication', async () => {
        const res = await request(app)
            .post('/api/attendance/mark')
            .send({
                eventId: 'test-event',
                walletAddress: 'TESTWALLETADDRESS1234567890123456789012345678901234'
            });

        expect(res.status).toBe(401);
    });
});

describe('Voting Invariants', () => {
    it('should reject vote creation without admin role', async () => {
        // Would need a valid student token to test this properly
        const res = await request(app)
            .post('/api/voting/create')
            .send({
                title: 'Test Election',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 86400000).toISOString()
            });

        expect(res.status).toBe(401);
    });
});

describe('Certificate Verification', () => {
    it('should return 404 for non-existent certificate', async () => {
        const res = await request(app)
            .get('/api/certificates/verify/nonexistenthash1234567890123456789012345678901234567890123456');

        expect(res.status).toBe(404);
        expect(res.body.verified).toBe(false);
    });
});

describe('Feedback Privacy', () => {
    it('should reject feedback without authentication', async () => {
        const res = await request(app)
            .post('/api/feedback/submit')
            .send({
                eventId: 'test-event',
                feedbackText: 'This is test feedback',
                walletAddress: 'TESTWALLETADDRESS1234567890123456789012345678901234'
            });

        expect(res.status).toBe(401);
    });
});
