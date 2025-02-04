import supertest from "supertest";
import mongoose from "mongoose";
import { faker } from '@faker-js/faker';
import app from "../src/app.js";
import connectDB from "../src/database/connection.js";
import userRoleSeeder from "../src/database/seeders/user_role.seeder.js";
import e from "express";

beforeAll(async () => {
    await connectDB();
    await userRoleSeeder();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoose.connection.readyState !== 0) {
        console.warn("Database connection still open!");
    }
});

const organiserUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "123456",
    roles: ["organiser"],
}
const participantUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "123456",
    roles: ["participant"],
}
let organiserToken, participantToken, organiser, participant, addedEvent, updatedEvent;
describe("Events API", () => {

    test("Signup organiser", async () => {
        const response = await supertest(app)
            .post("/user/signup")
            .send(organiserUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBeTruthy();
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("roles");
    });

    test("Signup participant", async () => {
        const response = await supertest(app)
            .post("/user/signup")
            .send(participantUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBeTruthy();
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("roles");
    });

    test("Login organiser", async () => {
        const response = await supertest(app)
            .post("/user/login")
            .send({
                email: organiserUser.email,
                password: organiserUser.password,
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        organiserToken = response.body.token;
        organiser = response.body.user;
    });

    test("Login participant", async () => {
        const response = await supertest(app)
            .post("/user/login")
            .send({
                email: participantUser.email,
                password: participantUser.password,
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        participantToken = response.body.token;
        participant = response.body.user;
    });

    test("Participant cannot create event", async () => {
        const response = await supertest(app)
            .post("/event")
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                date: faker.date.future(),
            });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Organiser can create event", async () => {
        const event = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            date: faker.date.future(),
        };
        const response = await supertest(app)
            .post("/event")
            .set("Authorization", `Bearer ${organiserToken}`)
            .send(event);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Event created successfully");
        expect(response.body).toHaveProperty("event");
        expect(response.body.event).toHaveProperty("title");
        expect(response.body.event.title).toBe(event.title)
        expect(response.body.event).toHaveProperty("description");
        expect(response.body.event.description).toBe(event.description)
        expect(response.body.event).toHaveProperty("date");
        addedEvent = response.body.event;
    });

    test("Participant can view public events", async () => {
        const response = await supertest(app)
            .get("/event")
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
    });

    test("Organiser can view public events", async () => {
        const response = await supertest(app)
            .get("/event")
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
    });

    test("Participants cannot view their own events", async () => {
        const response = await supertest(app)
            .get("/event/own")
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Check for newly added event data", async () => {
        const response = await supertest(app)
            .get(`/event/own`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0]).toHaveProperty("title");
        expect(response.body.data[0].title).toBe(addedEvent.title);
        expect(response.body.data[0]).toHaveProperty("description");
        expect(response.body.data[0].description).toBe(addedEvent.description);
    })

    test("Organiser can update own event", async() => {
        const event = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            date: faker.date.future(),
        };
        const response = await supertest(app)
            .put(`/event/${addedEvent.id}`)
            .set("Authorization", `Bearer ${organiserToken}`)
            .send(event);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Event updated successfully");
        expect(response.body).toHaveProperty("event");
        expect(response.body.event).toHaveProperty("title");
        expect(response.body.event.title).toBe(event.title)
        expect(response.body.event).toHaveProperty("description");
        expect(response.body.event.description).toBe(event.description)
        expect(response.body.event).toHaveProperty("date");
        updatedEvent = response.body.event;
    })

    test("Check for updated event data", async () => {
        const response = await supertest(app)
            .get(`/event/own`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0]).toHaveProperty("title");
        expect(response.body.data[0].title).toBe(updatedEvent.title);
        expect(response.body.data[0]).toHaveProperty("description");
        expect(response.body.data[0].description).toBe(updatedEvent.description);
    })

    test("Organiser can delete event", async () => {
        const response = await supertest(app)
            .delete(`/event/${updatedEvent.id}`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event");
        expect(response.body.event).toHaveProperty("title");
        expect(response.body.event.title).toBe(updatedEvent.title);
    })

    test("Check if event is deleted", async () => {
        const response = await supertest(app)
            .get(`/event/own`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
    })
});

describe("Subscriptions API", () => {
    test("Adding new event to test subscription", async () => {
        const event = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            date: faker.date.future(),
        };
        const response = await supertest(app)
            .post("/event")
            .set("Authorization", `Bearer ${organiserToken}`)
            .send(event);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Event created successfully");
        expect(response.body).toHaveProperty("event");
        expect(response.body.event).toHaveProperty("title");
        expect(response.body.event.title).toBe(event.title)
        expect(response.body.event).toHaveProperty("description");
        expect(response.body.event.description).toBe(event.description)
        expect(response.body.event).toHaveProperty("date");
        addedEvent = response.body.event;
    });

    test("Organiser cannot subscribe to event", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/subscribe`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Participant can subscribe to event", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/subscribe`)
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Subscribed successfully");
    });

    test("Verify participant subscription", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/subscribe`)
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Already subscribed to this event");
    });

    test("Organiser cannot view subscriptions", async () => {
        const response = await supertest(app)
            .get("/event/subscriptions")
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Verify participant subscriptions", async () => {
        const response = await supertest(app)
            .get("/event/subscriptions")
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0]).toHaveProperty("title");
        expect(response.body.data[0].title).toBe(addedEvent.title);
    });

    test("Participant cannot view subscribers", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/subscribers`)
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Organiser can view subscribers", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/subscribers`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event");
        expect(response.body.event).toHaveProperty("title");
        expect(response.body.event.title).toBe(addedEvent.title);
        expect(response.body).toHaveProperty("subscribers");
        expect(response.body.subscribers).toBeInstanceOf(Array);
        expect(response.body.subscribers.length).toBe(1);
    });

    test("Organiser cannot unsubscribe to event", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/unsubscribe`)
            .set("Authorization", `Bearer ${organiserToken}`);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized - Role not allowed");
    });

    test("Participant can unsubscribe from event", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/unsubscribe`)
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unsubscribed successfully");
    });

    test("Verify participant unsubscription", async () => {
        const response = await supertest(app)
            .get(`/event/${addedEvent.id}/unsubscribe`)
            .set("Authorization", `Bearer ${participantToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Not subscribed to this event");
    });
});