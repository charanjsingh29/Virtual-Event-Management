import validationSchema from './event.validation.js';
import eventModel from './event.model.js';
import eventSubscriberModel from './event_subscriber.model.js';
import { eventCollection, eventResource } from './event.resource.js';
import { userCollection } from '../user/user.resource.js';
import email from '../../config/email.js';
import { NODE_ENV } from "../../config/constants.js";

const create = async (req, res) => {
    const { error, value } = validationSchema.validate(req.body);
    if (error) {
        return res.validationError(error);
    }

    try {
        let event = value;
        event.owner = req.user.id;
        const newEvent = await eventModel.create(event);
        res.successWithMessage({event: eventResource(newEvent)}, "Event created successfully");
    } catch (error) {
        res.error(error.message);
    }
}

const readPublic = async (req, res) => {
    try {
        const events = await eventModel.find();
        res.success({data: eventCollection(events)});
    } catch (error) {
        res.error(error.message);
    }
}

const readOwn = async (req, res) => {
    const userId = req.user.id;
    try {
        const events = await eventModel.where({ owner: userId }).find();
        res.success({data: eventCollection(events)});
    } catch (error) {
        res.error(error.message);
    }
}

const update = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    const { error, value } = validationSchema.validate(req.body);
    if(error){
        return res.validationError(error);
    }

    const currentEvent = await eventModel.where({ owner: userId, _id: id }).findOne();
    if (!currentEvent) {
        return res.notFound();
    }

    try {
        const event = value;
        currentEvent.title = event.title;
        currentEvent.description = event.description;
        currentEvent.date = event.date;
        currentEvent.save();
        res.successWithMessage({event: eventResource(currentEvent)}, "Event updated successfully");
    } catch (error) {
        res.error(error.message);
    } 
}

const remove = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const event = await eventModel.where({ owner: userId, _id: id }).findOne();
    if(!event){
        return res.notFound();
    }

    try {
        await eventModel.deleteOne({ _id: id });
        res.successWithMessage({event: eventResource(event)}, "Event deleted successfully");
    } catch (error) {
        res.error(error.message);
    }
}

const subscribers = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const event = await eventModel.where({ owner: userId, _id: id }).findOne();
    if(!event){
        return res.notFound();
    }

    try {
        const subscriptions = await eventSubscriberModel.find({ event: id })
            .populate('subscriber') // Populate event details
            .sort({ subscribeAt: -1 }); // Optional: Sort by subscription date

        const subscribers = subscriptions.map(sub => sub.subscriber);
    
        return res.success({
            event: eventResource(event),
            subscribers: userCollection(subscribers)
        });
    } catch (error) {
        return res.error(error.message);
    }
}

const subscribe = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const eventExists = await eventModel.where({ _id: eventId }).findOne();
    if(!eventExists){
        return res.notFound();
    }
    const alreadySubscribed = await eventSubscriberModel.where({ event: eventId, subscriber: userId }).countDocuments();
    if(alreadySubscribed > 0){
        return res.error("Already subscribed to this event", 400);
    }

    try{
        await eventSubscriberModel.create({ event: eventId, subscriber: userId });

        // SENDING EMAIL
        let emailSent = true;
        if(NODE_ENV === 'production' || NODE_ENV === 'development'){
            const mailOptions = {
                to: req.user.email,
                subject: "Event Subscribed - " + eventExists.title,
                text: "You have subscribed to event " + eventExists.title,
            };
            try{
                await email.sendMail(mailOptions);
            }
            catch(error){
                emailSent = false;
            }
        }

        return res.successWithMessage({event: eventResource(eventExists), email_sent: emailSent}, "Subscribed successfully");
    } catch(error){
        return res.error(error.message);
    }
}

const unsubscribe = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const eventExists = await eventModel.where({ _id: eventId }).findOne();
    if(!eventExists){
        return res.notFound();
    }
    const alreadySubscribed = await eventSubscriberModel.where({ event: eventId, subscriber: userId }).countDocuments();
    if(alreadySubscribed == 0){
        return res.error("Not subscribed to this event", 400);
    }

    try{
        await eventSubscriberModel.where({ event: eventId, subscriber: userId }).deleteOne();

        // SENDING EMAIL
        let emailSent = true;
        if(NODE_ENV === 'production' || NODE_ENV === 'development'){
            const mailOptions = {
                to: req.user.email,
                subject: "Event Unsubscribed - " + eventExists.title,
                text: "You have unsubscribed to event " + eventExists.title,
            };
            try{
                await email.sendMail(mailOptions);
            }
            catch(error){
                emailSent = false;
            }
        }

        return res.successWithMessage({event: eventResource(eventExists), email_sent: emailSent}, "Unsubscribed successfully");
    } catch(error){
        return res.error(error.message);
    }
}

const subscriptions = async (req, res) => {
    const userId = req.user.id;

    try {
        const subscriptions = await eventSubscriberModel.find({ subscriber: userId })
            .populate('event') // Populate event details
            .sort({ subscribeAt: -1 }); // Optional: Sort by subscription date

        const events = subscriptions.map(sub => sub.event);
    
        return res.success({data: eventCollection(events)});
    } catch (error) {
        return res.error(error.message);
    }
}

export { create, readPublic, readOwn, update, remove, subscribers, subscribe, unsubscribe, subscriptions };