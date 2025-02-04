
const eventResource = (event) => {
    return {
        "id": event._id,
        "title": event.title,
        "description": event.description,
        "date": event.date.toISOString(),
    }
}

const eventCollection = (events) => events.map(eventResource);

export { eventResource, eventCollection };