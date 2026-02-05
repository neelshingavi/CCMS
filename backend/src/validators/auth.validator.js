const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']).optional(),
    wallet_address: z.string().length(58).optional() // Algorand addresses are 58 chars
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const validateRegister = (req, res, next) => {
    try {
        registerSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

module.exports = {
    registerSchema,
    loginSchema,
    validateRegister,
    validateLogin
};
