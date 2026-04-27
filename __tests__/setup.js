// Global test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.JWT_EXPIRES_IN = '15m';
process.env.COOKIE_SECRET = 'test-cookie-secret';
process.env.STRIPE_SECRET = 'sk_test_123456789';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpass';
process.env.FROM_NAME = 'Test App';
process.env.FROM_EMAIL = 'noreply@testapp.com';
