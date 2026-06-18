const repository = {

    events: [],
    services: [],

    async initialise() {

        this.events =
            await loadJson("./data/events.json");

        //this.services =
        //    await loadJson("./data/services.json");
    },

    getService(id) {
        return this.services.find(
            x => x.id === id
        );
    }
};