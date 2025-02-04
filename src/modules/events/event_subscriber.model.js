import mongoose from "mongoose";

const eventSubscriberSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subscribeAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model('EventSubscriber', eventSubscriberSchema);