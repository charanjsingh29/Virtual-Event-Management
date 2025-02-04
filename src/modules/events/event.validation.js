import Joi from "joi";

const eventSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    date: Joi.date().required(),
}).options({ abortEarly: false });

export default eventSchema;