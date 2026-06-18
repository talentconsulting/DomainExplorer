class RepositoryInitialiser {

    constructor() {
        this.cacheBustKey = Date.now().toString();
    }

    async initialise() {
        const manifest = await fetch('./data/manifest.json')
            .then(r => r.json());

        const services = [];
        const events = [];
        const dbs = [];

        for (const serviceId of manifest.services) {

            let service = await this.getService(serviceId);
            service.id = serviceId;
            service.publishedEvents = [];
            
            if (service !== undefined) {

                // Api Swagger spec
                service.api = await this.getApi(serviceId);

                // Events published by this service
                let eventsForService = await this.getEvents(serviceId);
                if(eventsForService !== undefined){
                    eventsForService.forEach(e => {
                        e.emittedFrom = serviceId;
                        e.knownSubscribers = []; 
                        service.publishedEvents.push(e.id);
                        events.push(e);
                    })
                }

                // Database owned by this service
                let dbForService = await this.getDb(serviceId);
                if(dbForService !== undefined){
                    dbs.push(dbForService);
                }
  
                services.push(service);
            }


        }

        events.forEach(evt => {
            services.forEach(s => {
                if (s.subscribedEvents.includes(evt.id)) {
                    evt.knownSubscribers.push(s.id);
                }
            })
        });

        return { 
            servicesRepo : new ServicesRepository(services),
            eventsRepo: new EventsRepository(events),
            databaseRepo: new DatabaseRepository(dbs)
        };
    }

    async getService(serviceId){
        return this.getJson(`./data/services/${serviceId}.json`, `service ${serviceId}`);
    }

    async getApi(serviceId){
        return this.getJson(`./data/apis/${serviceId}.json`, `api ${serviceId}`);
    }

    async getEvents(serviceId){
        return this.getJson(`./data/events/${serviceId}.json`, `events for service ${serviceId}`) || [];
    }

    async getDb(serviceId){
        var db = await this.getJson(`./data/dbs/${serviceId}.json`, `databases for service ${serviceId}`);

        if(db !== undefined){
            db.id = serviceId;
            db.schema = await this.getJson(`./data/dbSchema/${serviceId}.json`, `databases for service ${serviceId}`);
            db.layout = await this.getJson(`./data/dbLayout/${serviceId}.json`, `databases for service ${serviceId}`) || [];
        }

        return db;
    }

    async getJson(path, context){
        const freshPath = this.buildFreshPath(path);
        const response = await fetch(freshPath, { cache: 'no-store' });

        if (response.status === 404) {
            return undefined;
        }

        if (!response.ok) {
            throw new Error(`Failed to load ${context} from ${path}: ${response.status} ${response.statusText}`);
        }

        const responseCopy = response.clone();

        try {
            return await response.json();
        } catch {
            const body = await responseCopy.text();
            const preview = body.slice(0, 80).replace(/\s+/g, ' ').trim();
            throw new Error(`Invalid JSON for ${context} at ${path}. Response starts with: ${preview}`);
        }
    }

    buildFreshPath(path) {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}v=${this.cacheBustKey}`;
    }
}