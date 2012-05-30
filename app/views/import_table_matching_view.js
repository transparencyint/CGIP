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
    this.model = options.model.model;
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
        //CSV data
        model.forEach(function(row){

          //Print out the 4 headlines
          if(headline){
            var headlines = "<tr><th>Provider</th><th>Receiver</th><th>Pledged</th><th>Disbursed</th></tr>";

            table.$el.append(headlines);
            headline = false;
          }

          //Combine the columns and to the correct places

          var availableActor;
          var matchedActors = false;
          var matchedActorID = 0;
          var i = 0;
          

          //for each row in the CSV document get the column
          row.forEach(function(column){
            
            //console.log(column);
            var foundActor = "";

            //Check which type is column
            
            //go through each actor in the database
            if(i == matchedColumns[0] || i == matchedColumns[1]){
              dbActors.forEach(function(dbActor){
                if(column == dbActor.get('name'))
                {
                  matchedActors = true;
                  foundActor = column;
                  matchedActorID = j;
                  //console.log('Found', column, dbActor.get('name'));
                  console.log('Found ', dbActor.get('name'), 'in colum ', i, 'and line ', j);
                }
              });
          }
            i++;
            
          });
          j++;
          var tableRow = new ImportTableRowView({ model : row, availableActor : availableActor});

          if(matchedActors)
          {
            tableRow.setMarkedActor(matchedActorID);
          }

          tableRow.render();
          table.$el.append(tableRow.el);

        });

      }
    });

  },
});
