import { NODE_ENV, MONGODB_URL, MONGODB_DB_NAME } from "../config/constants.js";
import mongoose from "mongoose";
import userRoleSeeder from './seeders/user_role.seeder.js';

/* mongoose.connection.on('connected', async () => {
    console.log("Database connected successfully.");
    await userRoleSeeder();
}); */

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }
        let databaseName = MONGODB_DB_NAME;
        if(NODE_ENV === "testing"){
            databaseName += '-testing';
        }
        await mongoose.connect(MONGODB_URL, {
            dbName: databaseName,
        });
        console.log(`Connected to MongoDB ${databaseName}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB;