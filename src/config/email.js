import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from './constants.js';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST, // or use 'smtp.ethereal.email' for testing,
    port: SMTP_PORT,
    auth: {
        user: SMTP_USER, // Your email address
        pass: SMTP_PASS,    // Your app-specific password
    },
});

export default transporter;