class EventsView{

    route(routeParts){
        switch (routeParts[1]) {
            case "all"://events/all
                this.renderEventList(eventsRepository.getAllEvents(), "All Events", "All events across all apps");
                break;

            case "service"://events/service/{serviceId}/{interactionType}
                var serviceId = routeParts[2];
                var interactionType = routeParts[3];
                this.navigationEventsByService(serviceId, interactionType);
                break;

            case "event"://events/event/{eventId}
                this.renderEvent(routeParts[2]);
                break;

        }
    }


    navigationEventsByService(serviceId, interactionType){
        var service = servicesRepository.getServiceById(serviceId);

        if(interactionType === 'publish'){
            this.renderEventList(eventsRepository.getAllEvents().filter(e => service.publishedEvents.includes(e.id)), `Events for ${service.name}`, '');
        }
        
        if(interactionType === 'subscribe'){
            this.renderEventList(eventsRepository.getAllEvents().filter(e => service.subscribedEvents.includes(e.id)), `Events for ${service.name}`, '');
        }
    }

    renderEventList(events, navHeading, navDescription) {

        var eventsHtml = '';
        events.forEach(e=>{
            var service = servicesRepository.getServiceById(e.emittedFrom);
            eventsHtml += `<li><span onclick="navigate('/events/event/${e.id}')">${e.name}</span><span>${service.name}</span></li>`;
        })
        var html = `
            <div class='eventList'>
                <ul>
                    ${eventsHtml}
                </ul>
            </div>
        `;

        updatePage({
            selectedNav:'eventsNavigation',  
            navHeading:navHeading,
            navDescription:navDescription,
            content:html
        });

    }

    renderEvent(eventId) {

        var event = eventsRepository.getEventById(eventId);

        var subscribersHtml = `<span class="tag">0 subscribers</span>`;

        if(event.knownSubscribers.length > 0){
            subscribersHtml = `<span class="tag clickable" onclick="navigate('/services/eventsubscribers/${event.id}')">${event.knownSubscribers.length} subscribers</span>`;
        }

        var payloadTypeSchema = this.toTypeSchemaObject(event.payload || []);
        var payloadCodeBlock = this.escapeHtml(JSON.stringify(payloadTypeSchema, null, 2));

        var html = `
            <div class="detail-view">
                <section class="detail-panel">
                    <header class="detail-header">
                        <h3>${event.name}</h3>
                        <p>${event.description}</p>
                    </header>

                    <div class="detail-meta tag-group">
                        ${subscribersHtml}
                    </div>

                    <section class="detail-section">
                        <h4>Payload</h4>
                        <pre class="detail-code"><code>${payloadCodeBlock}</code></pre>
                    </section>
                </section>
            </div>
        `;

        updatePage({
            selectedNav:'eventsNavigation',  
            navHeading:'Event Detail',
            navDescription:'',
            content:html
        });
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    toTypeToken(typeName){
        const token = (typeName || 'unknown').toLowerCase();

        const primitiveTypeMap = {
            string: '<string>',
            guid: '<guid>',
            uuid: '<guid>',
            datetime: '<datetime>',
            date: '<date>',
            bool: '<boolean>',
            boolean: '<boolean>',
            int: '<int>',
            long: '<long>',
            short: '<short>',
            byte: '<byte>',
            decimal: '<decimal>',
            double: '<double>',
            float: '<float>',
            number: '<number>',
            enum: '<enum>'
        };

        return primitiveTypeMap[token] || `<${token}>`;
    }

    toTypeSchemaValue(fieldDefinition){
        const typeName = (fieldDefinition?.type || '').toLowerCase();

        var nullable = fieldDefinition.required ? '' : '?';

        if(typeName === 'object'){
            return this.toTypeSchemaObject(fieldDefinition.fields || []);
        }

        if(typeName === 'array'){
            if(!fieldDefinition.items){
                return [`<array-item${nullable}>`];
            }

            if((fieldDefinition.items.type || '').toLowerCase() === 'object'){
                return [this.toTypeSchemaObject(fieldDefinition.items.fields || [])];
            }

            return [this.toTypeToken(fieldDefinition.items.type || 'unknown')];
        }

        return this.toTypeToken(fieldDefinition.type + nullable || 'unknown');
    }

    toTypeSchemaObject(payloadFields){
        const schema = {};

        (payloadFields || []).forEach(field => {
            if(!field || !field.field){
                return;
            }

            schema[field.field] = this.toTypeSchemaValue(field);
        });

        return schema;
    }
}

const eventsView = new EventsView();