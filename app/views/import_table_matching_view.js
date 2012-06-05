var View = require('./view');
var Actors = require('models/actors');
var Import = require('models/import');
var MoneyConnection = require('models/connections/money_connection');
var MoneyConnections = require('models/connections/money_connections');
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
    this.newMoneyConnections = new MoneyConnections();
    var newMoneyConnections = this.newMoneyConnections;
    //console.log(model);
    console.log(tableColumns);

    dbActors.fetch({
      success: function(dbActors){

        var matchedColumns = new Array();
        var connections = new Array();

        for(i=0; i<tableColumns.length; i++)
        {
          if(tableColumns[i] == "provider")
            matchedColumns[0] = i;
          if(tableColumns[i] == "recipient")
            matchedColumns[1] = i;
          if(tableColumns[i] == "disbursed")
            matchedColumns[2] = i;
          if(tableColumns[i] == "pledged")
            matchedColumns[3] = i;
        }
        console.log(matchedColumns);

        //creating the new table with only 4 columns
        var newTable = new Array();
        var y = 0;
        model.forEach(function(row){
          var x = 0;
          var tempArray = new Array("" , "", "", "");
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
            x++;
          });
          y++;
        });
        console.log(newTable);


        //now create the table and find actors
        var j = 0;
        var k = 0;
        var l = 0;
        
        var matchingActors = new Array();

        //CSV data
        model.forEach(function(row){

          //Print out the 4 headlines
          if(headline){
            var headlines = "<tr><th>Provider</th><th>Recipient</th><th>Disbursed</th><th>Pledged</th></tr>";

            table.$el.append(headlines);
            headline = false;
          }

          //Combine the columns and to the correct places

          var matchedActors = false;
          var i = 0;
          var bothMarked = false;

          //for each row in the CSV document get the column
          row.forEach(function(column){
            
            var foundActor = "";
            

            //go through each actor in the database for the provider and receiver cell
            if(i == matchedColumns[0] || i == matchedColumns[1]){
              var addedColumn = false;
              dbActors.forEach(function(dbActor){
                
                if(column == dbActor.get('name'))
                {
                  matchedActors = true;
                  foundActor = column;
                  
                  if(i == matchedColumns[0])
                  {
                    matchingActors[k] = new Array('provider', dbActor.id, dbActor.get('name'), j , i);
                    console.log('Found ', dbActor.get('name'), 'in row ', j, 'and row ', i, 'type: provider');
                  }
                  else if(i == matchedColumns[1])
                  {
                    
                    matchingActors[k] = new Array('recipient', dbActor.id, dbActor.get('name'), j , i);
                    console.log('Found ', dbActor.get('name'), 'in row ', j, 'and row ', i, 'type: recipient');

                    if(k>0 && (matchingActors[k][3] == matchingActors[k-1][3]))
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
            if(i == matchedColumns[2] && bothMarked)
            {
              connections[l-1][2] = column;
            }
            if(i == matchedColumns[3] && bothMarked)
            {
              connections[l-1][3] = column;
            }

            i++;
            
          });
          
          var tableRow = new ImportTableRowView({ model : row});

          if(bothMarked)
          {
            tableRow.setMarkedActor();
            var moneyConnection = new MoneyConnection({
              from: connections[l-1][0],
              to: connections[l-1][1],
              disbursed: connections[l-1][2],
              pledged: connections[l-1][3]
            });

            newMoneyConnections.add(moneyConnection);
          }

          tableRow.render();
          table.$el.append(tableRow.el);
          j++
        });
        //end of the last row
        //console.log(matchingActors);
        console.log(newMoneyConnections);
        
       

      }
    });

  },
});
