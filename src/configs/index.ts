import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "..", "..", ".env"),
});

const CONFIGS = {
    APP_NAME: "bo-api",

    DEFAULT_EMAIL_FROM: "bidsloth <no-reply@bidsloth.com>",

    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://127.0.0.1:27017/bidsloth",

    // BCRYPT_SALT: process.env.BCRYPT_SALT || 10,
    BCRYPT_SALT: 10,

    JWT_SECRET: process.env.JWT_SECRET || "000-12345-000",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

    TOKEN_EXPIRY_DURATION: process.env.TOKEN_EXPIRY_DURATION || 900, // 15 minutes
    // TOKEN_EXPIRY_DURATION: 60 * 60 * 24, // expires in 24 hours
    // TOKEN_EXPIRY_DURATION: 60 * 15, // expires in 15 minutes

    ROLES: {
        USER: ["creator", "bidder"],
        ADMIN: ["admin"],
    },

    URL: {
        LANDING_BASE_URL: process.env.LANDING_BASE_URL || "http://localhost:3000",
        SERVER_BASE_URL: process.env.SERVER_BASE_URL || "http://localhost:4000",
    },

    MAILER: {
        SMTP_HOST: process.env.MAILER_SMTP_HOST,
        SMTP_PORT: process.env.MAILER_SMTP_PORT,
        SMTP_USER: process.env.MAILER_SMTP_USER,
        SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD,
        SECURE: process.env.MAILER_SECURE || false,
    },

    AWS: {
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        REGION: process.env.AWS_REGION,
    },

    STRIPE: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        WEBHOOK_SECRET_KEY: process.env.WEBHOOK_SECRET_KEY,
    },

    OPENAI: {
        API_KEY: process.env.OPENAI_API_KEY,
    }
};

// Uncomment below to check configs set
// console.log("CONFIGS:", CONFIGS);

export { CONFIGS };
