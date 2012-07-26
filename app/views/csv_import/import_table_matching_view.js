var View = require('views/view');
var Actors = require('models/actors');
var Import = require('models/import');
var MoneyConnection = require('models/connections/money_connection');
var MoneyConnections = require('models/connections/money_connections');
var ImportTableRowView = require('./import_table_row_view');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_table_matching',
  
  template: require('views/templates/csv_import/import_table'),
  tagName : 'table',
  className : 'import-table',

  initialize: function(options){
    this.tableColumns = options.tableColumns;
    this.country = options.country;
    this.dbActors = new Actors();
    this.dbActors.country = options.country;
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  render: function(){
    var table = this;
    var model = this.model;
    var tableColumns = this.tableColumns;
    var dbActors = this.dbActors;
    var headline = true;
    this.newMoneyConnections = new MoneyConnections();
    var newMoneyConnections = this.newMoneyConnections;

    dbActors.fetch({
      success: function(dbActors){

        var matchedColumns = new Array();
        var connections = new Array();

        //find the position of the needed columns in the old table 
        for(i=0; i<tableColumns.length; i++)
        {
          var position;
          if(tableColumns[i] == "provider")
            matchedColumns[0] = i;
          if(tableColumns[i] == "recipient")
            matchedColumns[1] = i;
          if(tableColumns[i] == "disbursed")
            matchedColumns[2] = i;
          if(tableColumns[i] == "pledged")
            matchedColumns[3] = i;
          if(tableColumns[i] == "source")
            matchedColumns[4] = i;
        }

        //creating the new table with only 5 columns
        //do this by going through each line of the old table
        var newTable = new Array();
        var y = 0;
        model.forEach(function(row){
          var x = 0;
          var tempArray = new Array("" , "", "", "", "");
          row.forEach(function(cell){
            if (x == matchedColumns[0]){
              tempArray[0] = cell;
              newTable[y] = tempArray;
            }
            if (x == matchedColumns[1]){
              tempArray[1] = cell;
              newTable[y] = tempArray;
            }
            if (x == matchedColumns[2]){
              tempArray[2] = cell;
              newTable[y] = tempArray;
            }
            if (x == matchedColumns[3]){
              tempArray[3] = cell;
              newTable[y] = tempArray;
            }
            if(x == matchedColumns[4]){
              tempArray[4] = cell;
              newTable[y] = tempArray;
            }
            x++;
          });
          y++;
        });

        //this 5-column table is now our model which is used for finding machting actors
        model = newTable;

        //now create the table and find actors
        var j = 0;
        var k = 0;
        var l = 0;
        
        var matchingActors = new Array();

        //CSV data
        model.forEach(function(row){

          //Print out the 4 headlines
          if(headline){
            var headlines = "<tr><th>Provider</th><th>Recipient</th><th>Disbursed</th><th>Pledged</th><th>Source</th></tr>";
            table.$el.append(headlines);
            headline = false;
          }

          //Combine the columns and to the correct places
          var matchedActors = false;
          var bothMarked = false;
          var columnCounter = 0;

          //for each row in the CSV document get the column
          row.forEach(function(column){
            var foundActor = "";

            //go through each actor in the database for the provider and receiver cell
            if(columnCounter == 0 || columnCounter == 1){
              var addedColumn = false;
              dbActors.forEach(function(dbActor){
                
                if(column == dbActor.get('name')){
                  matchedActors = true;
                  foundActor = column;
                  
                  if(columnCounter == 0)
                  {
                    matchingActors[k] = new Array('provider', dbActor.id, dbActor.get('name'), j , columnCounter);
                  }
                  else if(columnCounter == 1)
                  {
                    
                    matchingActors[k] = new Array('recipient', dbActor.id, dbActor.get('name'), j , columnCounter);

                    if(k > 0 && (matchingActors[k][3] == matchingActors[k-1][3]))
                    {
                      bothMarked = true;
                      connections[l] = new Array(matchingActors[k-1][1], matchingActors[k][1]);
                      l++;
                    }
                    
                  }

                  k++;    
                }
                
              });
            }
            if(columnCounter == matchedColumns[2] && bothMarked)
            {
              connections[l-1][2] = column;
            }
            if(columnCounter == matchedColumns[3] && bothMarked)
            {
              connections[l-1][3] = column;
            }
            if(columnCounter == matchedColumns[4] && bothMarked)
            {
              connections[l-1][4] = column;
            }

            columnCounter++;
            
          });
          
          var tableRow = new ImportTableRowView({ model : row});

          if(bothMarked)
          {
            tableRow.setMarkedActor();
            var moneyConnection = new MoneyConnection({
              country: table.country,
              from: connections[l-1][0],
              to: connections[l-1][1],
              disbursed: connections[l-1][2],
              pledged: connections[l-1][3],
              source: connections[l-1][4]
            });

            newMoneyConnections.add(moneyConnection);
          }

          tableRow.render();
          table.$el.append(tableRow.el);
          j++
        });
      }
    });

  },
});
