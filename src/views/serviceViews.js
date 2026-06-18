class ServicesView{

    route(routeParts){
        switch (routeParts[1]) {
            case "all"://services/all
                this.renderServicesList(servicesRepository.getAllServices(), "All Services", "", true);
                break;

            case "team"://services/team/{teamId}
                this.navigationServicesByTeam(routeParts[2]);
                break;

            case "service"://services/service/{serviceId}
                var service = servicesRepository.getServiceById(routeParts[2]);
                this.renderServicesList([service], service.name,'');
                break;

            case "eventsubscribers"://services/eventsubscribers/{eventId}
                var services = servicesRepository.getAllServices().filter(s=> s.subscribedEvents.includes(routeParts[2]));
                this.renderServicesList(services, `Services subscribing to ${routeParts[2]}`, '');
                break;
        }
    }

    navigationServicesByTeam(teamId){
        var team = TeamsRepository.getTeamById(teamId);
        var services = [];

        team.services.forEach(serviceId=> services.push(servicesRepository.getServiceById(serviceId)));

        this.renderServicesList(services, `${team.name} Team - Services`, '');

    }

    navigationToggleServicesView(){
        var button = document.getElementById("buttonServicesViewToggle");
        var listView = document.getElementById("servicesListView");
        var diagramView = document.getElementById("servicesDiagramView");

        if(button.innerHTML === 'List View'){
            button.innerHTML = 'Diagram View';
            listView.className = '';
            diagramView.className = 'hidden'; 
        }
        else{
            button.innerHTML = 'List View';
            listView.className = 'hidden';
            diagramView.className = '';
        }

    }

    renderServicesList(services, navHeading, navDescription, toggleButton = false) {

        var servicesHtml = '';

        var navHeadingWithButton = navHeading;
        if(toggleButton){
            navHeadingWithButton = `${navHeading} <button id="buttonServicesViewToggle" onclick="servicesView.navigationToggleServicesView()">Diagram View</button>`;
        }

        services.forEach(s=>{ servicesHtml += this.generateCardHtml(s); });

        var html = `
            <div id="servicesListView">
                <div class="card-grid">
                    ${servicesHtml}
                </div>
            </div>
            <div id="servicesDiagramView" class="hidden">
                <div id="graph"></div>
            </div>
        `;

        updatePage({
            selectedNav:'servicesNavigation',  
            navHeading:navHeadingWithButton,
            navDescription:navDescription,
            content:html
        });

        if(toggleButton){
            this.generateDiagramHtlm(services);
        }
    }

    generateCardHtml(service){

        var button = '';

        if(service.api != undefined){
            button = `<button onclick="navigate('/api/${service.id}')">View Apis</button>`;
        }

        return `
                <article class="card">
                    <h3>${service.name}</h3>

                    <p>${service.description}</p>

                    <span>Events</span>
                    <div class="tag-group">
                        <span class="tag clickable" onclick="navigate('/events/service/${service.id}/publish')">Publishes ${service.publishedEvents.length} events</span>
                        <span class="tag clickable" onclick="navigate('/events/service/${service.id}/subscribe')">Consumes ${service.subscribedEvents.length} event</span>
                    </div>

                    <span>Api calls</span>
                    <div class="tag-group">
                        <span class="tag">Calls ${service.callsService.length} services</span>
                        <span class="tag">Receives ${service.getsCalledFromService.length} calls from services</span>
                    </div>

                    ${button}

                </article>`;
    }

    generateDiagramHtlm(services){

        var elements = [];

        // Add Services and Api calls
        services.forEach(s=>{

            // Add service node
            elements.push({
                data: {
                    id: s.id,
                    label: s.name,
                    type: 'service'
                }
            });

            // Add edges for api calls
            s.callsService.forEach(apiCall=>{
                elements.push({
                    data: {
                        source: s.id,
                        target: apiCall,
                        label: 'Api Call'
                    }
                });
            });

            // Add edges for events
            s.publishedEvents.forEach(evt => {

                services.forEach(subscriber => {
                    if (subscriber.subscribedEvents.includes(evt)) {
                        elements.push({
                            data: {
                                source: s.id,
                                target: subscriber.id,
                                label: 'Event',
                                type:'event'
                            }
                        });
                    }
                });
            });
        });

        cy = cytoscape({

            container: document.getElementById("graph"),
            elements:elements,
            style: [

                {
                    selector: 'node',
                    style: {
                        'background-color': '#60a5fa',
                        'label': 'data(label)',
                        'color': '#fff'
                    }
                },
                {
                    selector: 'edge',
                    style: {

                        'width': 3,

                        'line-color': '#60a5fa',

                        'target-arrow-color': '#60a5fa',
                        'target-arrow-shape': 'triangle',

                        'arrow-scale': 1.8,

                        'curve-style': 'bezier',

                        'label': 'data(label)',

                        'font-size': '11px',
                        'font-weight': '600',

                        'color': '#d1d5db',

                        'text-background-color': '#111827',
                        'text-background-opacity': 0.9,
                        'text-background-padding': '3px',

                        'text-rotation': 'autorotate',

                        'source-endpoint': 'outside-to-node',
                        'target-endpoint': 'outside-to-node'
                    }
                },
                {
                    selector: 'node[type="service"]',
                    style: {

                        'shape': 'roundrectangle',

                        'background-color': '#1e3a5f',
                        'border-width': 2,
                        'border-color': '#60a5fa',

                        'width': 160,
                        'height': 50,

                        'label': 'data(label)',

                        'color': '#f3f4f6',
                        'font-size': '14px',
                        'font-weight': '600',

                        'text-valign': 'center',
                        'text-halign': 'center',

                        'text-wrap': 'wrap',
                        'text-max-width': '160px',

                        'padding': '10px',

                        'overlay-padding': '4px',

                        'transition-property':
                            'background-color, border-color',

                        'transition-duration': '0.2s'
                    }
                },
                {
                    selector: 'edge[type="event"]',
                    style: {
                        'line-color': '#34d399',
                        'target-arrow-color': '#34d399',
                        'mid-target-arrow-color': '#34d399'
                    }
                }
            ],

            layout: {
                name: 'breadthfirst',
                directed: true,
                padding: 30,
                spacingFactor: 1.2
            }
            
        });

        //cy.on('tap', 'node', function(evt) {
            //const node = evt.target;

            //const id = node.id();

            //renderServicePage(id);
        //});
    }
}
const servicesView = new ServicesView();