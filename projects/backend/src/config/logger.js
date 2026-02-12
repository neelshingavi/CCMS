const winston = require('winston');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

const transports = [];

// File transports only in production
if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    transports.push(
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    );
}

// Console transport always (formatted differently per env)
transports.push(new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.simple(),
}));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'ccms-backend' },
    transports,
});

module.exports = logger;

