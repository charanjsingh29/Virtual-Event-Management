import { CORS_ORIGIN } from "./config/constants.js";
import express from "express";
import cors from "cors";
import jwtMiddleware from "./middlewares/jwt.middleware.js";
import apiResponseMiddleware from "./middlewares/api_response.middleware.js";
import userRoutes from "./modules/user/user.route.js";
import eventRoutes from "./modules/events/event.route.js";

const app = express();
app.use(cors(
    {
        origin: CORS_ORIGIN,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(apiResponseMiddleware);

app.get("/ping", (req, res) => { 
    res.send("pong");
});

app.use('/user', userRoutes);
app.use('/event', jwtMiddleware, eventRoutes);

export default app;