class DatabaseView{

    route(routeParts){
        switch (routeParts[1]) {
            case "all":
                this.renderDbList(databaseRepository.getAllDbs(), "All Databases", "");
                break;

            case "schema":
                this.navigateDbView(routeParts[2]);
                break;

        }
    }

    renderDbList(dbs, navHeading, navDescription) {

        var databasesHtml = '';

        dbs.forEach(d=>{ databasesHtml += this.generateDbCardHtml(d); });

        var html = `
            <div>
                <div class="card-grid">
                    ${databasesHtml}
                </div>
            </div>
        `;

        updatePage({
            selectedNav:'databasesNavigation',  
            navHeading:navHeading,
            navDescription:navDescription,
            content:html
        });
    }

    generateDbCardHtml(db){

        var button = '';

        return `
                <article class="card clickable" onclick="navigate('/database/schema/${db.id}')">
                    <h3>${db.name}</h3>

                    <p>${db.description}</p>

                </article>`;
    }

    navigateDbView(dbId){

        var db = databaseRepository.getDbById(dbId);

        var html = `
            <div>
                <div id="graph"></div>
            </div>
        `;

        updatePage({
            selectedNav:'databasesNavigation',  
            navHeading:`${db.name} Schema`,
            navDescription:'',
            content:html
        });

        this.renderDatabaseSchema(db.schema);
    }

    renderDatabaseSchema(schema) {

        const elements = [];

        // -------------------------------------
        // Create table nodes
        // -------------------------------------

        schema.tables.forEach(table => {

            var longestName = table.columns.reduce((max, c)  => { 
                return Math.max(max, c.name.length + c.type.length); 
            }, 0) + 5;// add 5 for additional space between name and type

            const columnText = table.columns
                .map(c => {

                    const pk =
                        c.primaryKey
                            ? '🔑 '
                            : '    ';

                    var padding = longestName - c.type.length;
                    const name =
                        c.name.padEnd(padding, ' ');

                    return `${pk}${name} ${c.type}`;
                })
                .join('\n');

            const label =
                `${table.name}\n────────────────\n${columnText}`;

            elements.push({
                data: {
                    id: table.name,
                    label,
                    type: 'table'
                },
                position: {
                    x:table.x, y:table.y
                }
            });
        });

        // -------------------------------------
        // Create relationships
        // -------------------------------------

        schema.tables.forEach(table => {

            table.relationships.forEach(r => {

                elements.push({
                    data: {
                        source: table.name,
                        target: r.targetTable,
                        label: r.column,
                        relationshipType: 'foreignKey'
                    }
                });
            });
        });

        // -------------------------------------
        // Create graph
        // -------------------------------------

        cy = cytoscape({

            container: document.getElementById('graph'),

            elements,

            style: [

                // ---------------------------------
                // Tables
                // ---------------------------------

                {
                    selector: 'node[type="table"]',
                    style: {

                        'shape': 'roundrectangle',

                        'background-color': '#1e293b',

                        'border-width': 2,
                        'border-color': '#60a5fa',

                        'label': 'data(label)',

                        'color': '#f3f4f6',

                        'font-family': 'Consolas',
                        'font-size': '20px',

                        'text-wrap': 'wrap',

                        'text-valign': 'center',
                        'text-halign': 'center',

                        'padding': '14px',

                        'width': 'label',
                        'height': 'label'
                    }
                },
                // ---------------------------------
                // Foreign key edges
                // ---------------------------------

                {
                    selector: 'edge[relationshipType="foreignKey"]',
                    style: {

                        'width': 3,

                        'line-color': '#34d399',

                        'target-arrow-color': '#34d399',
                        'target-arrow-shape': 'triangle',

                        'curve-style': 'bezier',

                        'label': 'data(label)',

                        'font-size': '10px',
                        'font-weight': '600',

                        'color': '#d1d5db',

                        'text-background-color': '#111827',
                        'text-background-opacity': 1,
                        'text-background-padding': '3px',

                        'arrow-scale': 1.8,

                        'text-rotation': 'autorotate'
                    }
                }
            ],

            layout: {
                name: 'preset'
            }
        });

        // -------------------------------------
        // Click handling
        // -------------------------------------

        cy.on('tap', 'node', evt => {

            const tableName =
                evt.target.id();

            console.log(tableName);

            // renderTable(tableName)
        });
    }
}
const dbView = new DatabaseView();