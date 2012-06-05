var View = require('./view');
var Actors = require('models/actors');
var Import = require('models/import');
var ImportTableRowView = require('./import_table_row_view');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_table_matching',
  
  template: require('./templates/import_table'),
  tagName : 'table',
  className : 'import-table',

  initialize: function(options){
    this.model = options.model;
    this.tableColumns = options.tableColumns;

    this.dbActors = new Actors();
    _.bindAll(this, 'setActors'); 
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  setActors: function(model){
    console.log("DB Entry:", model);
    this.dbActors.forEach(function(model){
      console.log("DB Actor");  
      console.log("DB Actors:", model.get('name'));  
    }); 
  },

  render: function(){
    var table = this;
    var model = this.model;
    var tableColumns = this.tableColumns;
    var dbActors = this.dbActors;
    var headline = true;

    //console.log(model);
    console.log(tableColumns);

    dbActors.fetch({
      success: function(dbActors){

        var matchedColumns = new Array();
        
        for(i=0; i<tableColumns.length; i++)
        {
          if(tableColumns[i] == "provider")
            matchedColumns[0] = i;
          if(tableColumns[i] == "recipient")
            matchedColumns[1] = i;
          if(tableColumns[i] == "pledged")
            matchedColumns[2] = i;
          if(tableColumns[i] == "disbursed")
            matchedColumns[3] = i;
        }


        console.log(matchedColumns);
        var j = 0;
        var k = 0;
        var matchingActors = new Array();
        //CSV data
        model.forEach(function(row){

          //Print out the 4 headlines
          if(headline){
            var headlines = "<tr><th>Provider</th><th>Receiver</th><th>Pledged</th><th>Disbursed</th></tr>";

            table.$el.append(headlines);
            headline = false;
          }

          //Combine the columns and to the correct places

          var matchedActors = false;
          var i = 0;
          

          //for each row in the CSV document get the column
          row.forEach(function(column){
            
            var foundActor = "";
            
            
            //go through each actor in the database for the provider and receiver cell
            if(i == matchedColumns[0] || i == matchedColumns[1]){
              dbActors.forEach(function(dbActor){
                if(column == dbActor.get('name'))
                {
                  matchedActors = true;
                  foundActor = column;
                  matchingActors[k] = new Array(i , j);
                  k++;
                  console.log('Found ', dbActor.get('name'), 'in column ', i, 'and line ', j);
                }
              });
          }
            i++;
            
          });
          
          var tableRow = new ImportTableRowView({ model : row});

          if(matchedActors)
          {
            tableRow.setMarkedActor();
          }

          tableRow.render();
          table.$el.append(tableRow.el);
          j++
        });
        //end of the last row
        console.log(matchingActors);

        //mark the found actors
        for (var k = 0; k < matchingActors.length; k++){

        }

      }
    });

  },
});
