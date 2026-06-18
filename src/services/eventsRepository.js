class EventsRepository {
    
    constructor(data){
        this.events = data;
    }

    getAllEvents(){
        var events = [];
        this.events.forEach(e=> events.push(this.getEvent(e)));
        return events;
    }

    getEventById(eventId){ 
        return this.getEvent(this.events.find(e=>e.id===eventId));
    }

    getEvent(eventBasic) {

        const emittedFrom = [];
        const knownSubscribers = [];
        const triggers = [];

        return {
            id: eventBasic.id,
            name: eventBasic.name,
            description: eventBasic.description,
            emittedFrom: eventBasic.emittedFrom,
            knownSubscribers : eventBasic.knownSubscribers,
            payload: eventBasic.payload || []
        };
    }
}