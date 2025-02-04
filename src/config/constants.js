import { config } from "dotenv";
config.apply();

const NODE_ENV = process.env.NODE_ENV || "production";
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const MONGODB_URL = process.env.MONGODB_URI || "";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT || "";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "";

export { 
    NODE_ENV, 
    SERVER_PORT, 
    CORS_ORIGIN, 
    JWT_SECRET, 
    JWT_EXPIRES_IN, 
    MONGODB_URL, 
    MONGODB_DB_NAME,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
};