class ServicesRepository {

    constructor(data){
        this.services = data;
    }

    getAllServices(){
        var services = [];
        this.services.forEach(s=> services.push(this.getService(s)));
        return services;
    }

    getServiceById(serviceId){ 
        return this.getService(this.services.find(s=>s.id===serviceId));
    }

    getService(service){

        
        return {
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "publishedEvents": service.publishedEvents,
            "subscribedEvents": service.subscribedEvents,
            "databases": [],
            "callsService":service.calls,
            "getsCalledFromService":[],
            "api": service.api
        };
    }
}