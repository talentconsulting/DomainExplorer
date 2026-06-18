class ApiView{

    route(routeParts){
        // route  = /api/{serviceId}
        // route with selected endpoint = /api/{serviceId}/endpoint/{endpointId}
        var serviceId = routeParts[1];
        this.renderApi(serviceId);

        if(routeParts.length> 2){
            this.navigationShowDetail(routeParts[3]);
            var element = document.getElementById(`operations-detail-${routeParts[3]}`);
            element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

        }
    }

    navigationShowDetail(id){
        var element = document.getElementById(`operations-detail-${id}`);

        if(element.className == 'hidden'){
            element.className = 'opblock-body';
        }
        else{
            element.className = 'hidden';
        }
    }

    renderApi(serviceId) {

        const service = servicesRepository.getServiceById(serviceId);
        const api = this.parseOpenApi(service.api);

        if (!api) return;

        var innerHtml = '';

        api.forEach(tagGroup =>{

            innerHtml +=`
                <span>
                    <h3 class="opblock-tag no-desc" id="operations-tag-${tagGroup.tag}" data-tag="${tagGroup.tag}">
                        <span>${tagGroup.tag}</span>
                    </h3>
                    <div class="no-margin">
                        <div class="operation-tag-content">
            `;

            tagGroup.endpoints.forEach(endpoint=>{

                var id = `${tagGroup.tag}-${endpoint.method.toLowerCase()}_${endpoint.path}`.replace(/[^a-zA-Z0-9-_]/g, '_');

                var responsesHtml = '';

                endpoint.responses.forEach(response=>{
                    responsesHtml += `
                    <tr class="response " data-code="${response.code}">
                        <td class="response-col_status">${response.code}</td>
                        <td class="response-col_description">
                            <div class="response-col_description__inner">
                                <div class="renderedMarkdown">
                                    <p>${response.description}</p>
                                </div>
                            </div>
                        </td>

                    </tr>`;
                });

                var requestBody = '';

                if(endpoint.requestBody != undefined){
                    requestBody = `
                        <div class="opblock-section opblock-section-request-body">
                            <div class="opblock-section-header"> 
                                <h4 class="opblock-title">Request body</h4>
                            
                            </div>
                            <div class="opblock-description-wrapper">
                                <div>
                                    <div class="model-example">
                                        <div data-name="examplePanel">
                                            <div class="highlight-code">
                                                <pre class="body-param__example microlight" style="display: block; overflow-x: auto; padding: 0.5em; background: rgb(51, 51, 51); color: white;">
                                                    <code class="language-json" style="white-space: pre;">${JSON.stringify(endpoint.requestBody, null, 2)}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }

                innerHtml += `
                <span>
                    <div class="opblock opblock-${endpoint.method.toLowerCase()}" id="operations-${id}" onclick="apiView.navigationShowDetail('${id}')">
                        <div class="opblock-summary opblock-summary-${endpoint.method.toLowerCase()}">
                            <div class="opblock-summary-control">
                                <span class="opblock-summary-method">${endpoint.method}</span>
                                <div class="opblock-summary-path-description-wrapper">
                                    <span class="opblock-summary-path" data-path="${endpoint.path}">
                                        <a class="nostyle">
                                            <span>${endpoint.path}</span>
                                        </a>
                                    </span>
                                    <div class="opblock-summary-description">${endpoint.description}</div>
                                </div>
                            </div>
                        </div>


                    <div class="hidden" id="operations-detail-${id}">
                        ${requestBody}
                        <div class="responses-wrapper">
                            <div class="opblock-section-header">
                                <h4>Responses</h4>
                            </div>
                            <div class="responses-inner">
                                <table aria-live="polite" class="responses-table" id="put_learning__learningKey__learning-support_responses" role="region">
                                    <thead>
                                        <tr class="responses-header">
                                            <td class="col_header response-col_status">Code</td>
                                            <td class="col_header response-col_description">Description</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    ${responsesHtml}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>



                    </div>


                </span>
                `;
            });


            innerHtml += `</div></div></span>`;
        })

        var html = `
            <div class='swagger-ui'>

                    ${innerHtml}

            </div>
        `;

        updatePage({
            selectedNav:'servicesNavigation',
            navHeading:`${service.name}`,
            navDescription:'',
            content: html
        });
    }

    parseOpenApi(swagger) {

        const endpoints = [];

        Object.entries(swagger.paths).forEach(([path, methods]) => {

            Object.entries(methods).forEach(([method, operation]) => {

                // -----------------------------
                // Responses
                // -----------------------------
                const responses = [];

                Object.entries(operation.responses ?? {}).forEach(r => {

                    responses.push({
                        code: r[0],
                        description: r[1].description
                    });
                });

                // -----------------------------
                // Request Body
                // -----------------------------
                let requestBody = undefined;

                if (operation.requestBody != undefined) {

                    const content =
                        Object.entries(operation.requestBody.content)[0][1];

                    const schema =
                        this.resolveSchema(content.schema, swagger);

                    requestBody = schema;
                }

                endpoints.push({

                    id:
                        operation.operationId ??
                        `${method}-${path}`,

                    method:
                        method.toUpperCase(),

                    path,

                    summary:
                        operation.summary ?? '',

                    description:
                        operation.description ?? '',

                    tags:
                        operation.tags ?? ['Misc'],

                    responses,

                    requestBody
                });
            });
        });

        // -----------------------------
        // Group by tag
        // -----------------------------
        const taggedEndpoints = [];

        endpoints.forEach(e => {

            const tag = e.tags[0];

            let groupedEndpoints =
                taggedEndpoints.find(te => te.tag === tag);

            if (groupedEndpoints == undefined) {

                groupedEndpoints = {
                    tag,
                    endpoints: []
                };

                taggedEndpoints.push(groupedEndpoints);
            }

            groupedEndpoints.endpoints.push(e);
        });

        return taggedEndpoints;
    }


    // ========================================
    // Schema Resolution
    // ========================================

    resolveSchema(schema, swagger) {

        if (!schema) {
            return undefined;
        }

        // ------------------------------------
        // Handle $ref
        // ------------------------------------

        if (schema["$ref"]) {

            const schemaName =
                schema["$ref"]
                    .replace('#/components/schemas/', '');

            const referencedSchema =
                swagger.components.schemas[schemaName];

            return this.resolveSchema(referencedSchema, swagger);
        }

        // ------------------------------------
        // Handle object
        // ------------------------------------

        if (schema.type === 'object') {

            const result = {};

            Object.entries(schema.properties ?? {})
                .forEach(([propertyName, propertySchema]) => {

                    result[propertyName] =
                        this.resolveSchema(propertySchema, swagger);
                });

            return result;
        }

        // ------------------------------------
        // Handle array
        // ------------------------------------

        if (schema.type === 'array') {

            return [
                this.resolveSchema(schema.items, swagger)
            ];
        }

        // ------------------------------------
        // Handle primitive types
        // ------------------------------------

        if (schema.format) {
            return `${schema.type}:${schema.format}`;
        }

        return schema.type ?? 'unknown';
    }
}
const apiView = new ApiView();
