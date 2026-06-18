class DatabaseRepository {
    
    constructor(data){
        this.dbs = data;
    }

    getAllDbs(){
        var dbs = [];
        this.dbs.forEach(x=> dbs.push(this.getDb(x)));
        return dbs;
    }

    getDbById(dbId){ 
        return this.getDb(this.dbs.find(x=> x.id === dbId));
    }

    getDb(dbBasic) {

        const schema = this.convertToSchema( dbBasic.name, dbBasic.schema, dbBasic.layout );
        return {
            "id":dbBasic.id,
            "name":dbBasic.name,
            "description":dbBasic.description,
            "schema":schema
        }; 
    }

    convertToSchema(databaseName, tables, layout) {

        const schema = {

            database: databaseName,

            tables: []
        };

        // -------------------------------------
        // Convert tables
        // -------------------------------------

        tables.forEach(table => {

            var tableLocation = layout.find(x=>x.id == table.tableName); 

            if(tableLocation == undefined){
                tableLocation = {x:0, y:0};
            }

            const convertedTable = {

                name: table.tableName,

                columns: [],

                relationships: [],
                x: tableLocation.x,
                y: tableLocation.y
            };

            // ---------------------------------
            // Convert columns
            // ---------------------------------

            table.columns.forEach(column => {

                convertedTable.columns.push({

                    name: column.columnName,

                    type: column.dataType,

                    nullable: column.is_nullable,

                    primaryKey: this.isPrimaryKey(column.columnName)
                });
            });

            if(table.relationships != undefined){
                table.relationships.forEach(r=>{
                    convertedTable.relationships.push({
                        targetTable: r.targetTable,
                        column: r.columnName
                    });
                });
            }

            if(convertedTable.name != '__RefactorLog' && convertedTable.name != 'sysdiagrams'){
                schema.tables.push(convertedTable);
            }
        });

        return schema;
    }



    // =========================================
    // PK detection
    // =========================================

    isPrimaryKey(columnName) {

        const lower =
            columnName.toLowerCase();

        return (
            lower === 'id' ||
            lower === 'key'
        );
    }
}