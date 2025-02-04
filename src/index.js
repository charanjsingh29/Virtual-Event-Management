import app from './app.js';
import connectDB from './database/connection.js';
import { NODE_ENV, SERVER_PORT } from "./config/constants.js";

connectDB().then(() => {
    app.listen(SERVER_PORT, () => {
        console.log(`${NODE_ENV} Server listening on port ${SERVER_PORT}`);
    })
})