import joi from "joi";
import jwt from "jsonwebtoken";
import userSchema from "./user.model.js";
import { userResource } from "./user.resource.js";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../../config/constants.js";
import { UserRoles } from "./user.enum.js";
import userRoleSchema from "../user_role/user_role.model.js";
import email from '../../config/email.js';

const signUp = async (req, res) => {
    const validationSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        roles: joi.array()
        .items(joi.string().valid(UserRoles.ADMIN, UserRoles.ORGANISER, UserRoles.PARTICIPANT))
        .min(1)
        .default([UserRoles.PARTICIPANT])
    }).options({ abortEarly: false });
    const { error, value } = validationSchema.validate(req.body);
    
    if(error){
        return res.validationError(error);
    }
    
    try {
        const user = value;
        const emailExists = await userSchema.findOne({ email: user.email });
        if (emailExists) {
            const uniqueError = {
                details: [
                  {
                    message: '"email" already exists',
                    path: ["email"],
                  }
                ]
            }
            return res.validationError(uniqueError);
        }

        let roleId = [];
        for (const role of user.roles) {
            const foundRole = await userRoleSchema.findOne({ name: role });
            if(!foundRole){
                return res.error(`Role ${role} not found`);
            }
            roleId.push(foundRole._id);
        }
        const newUser = await userSchema.create({
            name: user.name,
            email: user.email,
            password: user.password,
            roles: roleId
        });
        await newUser.populate('roles');

        // SENDING EMAIL
        let emailSent = true;
        if(NODE_ENV === 'production' || NODE_ENV === 'development'){
            const mailOptions = {
                to: newUser.email,
                subject: "Welcome aboard!",
                text: "You have successfully signed up with email: " + user.email,
            };
            try{
                await email.sendMail(mailOptions);
            }
            catch(error){
                emailSent = false;
            }
        }

        const userRes = userResource(newUser);
        res.successWithMessage({user: userRes, email_sent: emailSent}, "User created successfully");
    } catch (error) {
        res.error(error.message);
    }
};

const login = async (req, res) => {
    const loginValidationSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    }).options({ abortEarly: false });
    const { error, value } = loginValidationSchema.validate(req.body);
    if (error) {
        return res.validationError(error);
    }
    const email = value.email;
    const password = value.password;
    try {
        const user = await userSchema.findOne({ email }).populate('roles', 'name');
        if(!user){
            return res.error("Email and password combination is not valid", 401);
        }
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.error("Email and password combination is not valid", 401);
        }
        const userRes = userResource(user);
        const token = jwt.sign({id: user._id, email: user.email}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        res.successWithMessage({user: userRes, token: token}, "User logged in successfully");
    }
    catch (error) {
        res.error(error.message);
    }
}

export { signUp, login };