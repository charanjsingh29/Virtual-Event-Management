import mongoose from "mongoose";
import bycrypt from "bcrypt";
import { UserRoles } from "./user.enum.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRole",
        default: UserRoles.PARTICIPANT
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }

    try{
        const salt = bycrypt.genSaltSync(10);
        this.password = bycrypt.hashSync(this.password, salt);
        next();
    }
    catch(error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bycrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);