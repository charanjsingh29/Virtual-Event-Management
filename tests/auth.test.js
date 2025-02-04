import supertest from 'supertest';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import app from '../src/app.js';
import connectDB from '../src/database/connection.js';
import userRoleSeeder from '../src/database/seeders/user_role.seeder.js';

beforeAll(async () => {
    await connectDB();
    await userRoleSeeder();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoose.connection.readyState !== 0) {
        console.warn('Database connection still open!');
    }
});

describe("Auth API", () => {
    const mockUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: '123456',
        roles: ['participant']
    };

    test("Signup without email", async () => {
        const response = await supertest(app)
            .post("/user/signup")
            .send({
                name: mockUser.name,
                password: mockUser.password,
                roles: mockUser.roles
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toContain("\"email\" is required");
    });

    test("Signup with invalid role", async () => {
        const response = await supertest(app)
            .post("/user/signup")
            .send({
                name: mockUser.name,
                email: mockUser.email,
                password: mockUser.password,
                roles: ['invalid']
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toContain("\"roles[0]\" must be one of [admin, organiser, participant]");
    });

    test("Signup with valid data", async () => {
        const response = await supertest(app)
            .post("/user/signup")
            .send(mockUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBeTruthy();
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("roles");
    });

    test("Login with invalid email", async () => {
        const response = await supertest(app)
            .post("/user/login")
            .send({
                email: "dummy@dummy.com",
                password: "123456"
            });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).not.toBeTruthy();
        expect(response.body).toHaveProperty("message");
    });

    test("Login with valid email", async () => {
        const response = await supertest(app)
            .post("/user/login")
            .send({
                email: mockUser.email,
                password: mockUser.password
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBeTruthy();
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("roles");
    });
});