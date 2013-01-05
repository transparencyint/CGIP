var View = require('views/view');
var Actors = require('models/actors');
var MoneyConnection = require('models/connections/money_connection');
var MoneyConnections = require('models/connections/money_connections');
var ImportTableRowView = require('./import_table_row_view');
var TableHeadline = require('views/templates/csv_import/import_matched_headlines');

module.exports = View.extend({
  
  tagName : 'table',
  className : 'darkTable',

  initialize: function(options){
    this.selectedColumns = options.selectedColumns;
    this.country = options.country;
    this.dbActors = new Actors();
    this.dbActors.country = options.country;
  },

  /**
    Find the positions of the needed columns from the old table 
    and save it in a new ordered (Provider,Recipient etc) array
  **/
  matchedColumnPosition : function(){
    var selectedColumns = this.selectedColumns;
    var matchedColumns = new Array();
    for(i=0; i<selectedColumns.length; i++)
    {
      if(selectedColumns[i] == "provider")
        matchedColumns[0] = i;
      else if(selectedColumns[i] == "recipient")
        matchedColumns[1] = i;
      else if(selectedColumns[i] == "disbursed")
        matchedColumns[2] = i;
      else if(selectedColumns[i] == "pledged")
        matchedColumns[3] = i;
      else if(selectedColumns[i] == "source")
        matchedColumns[4] = i;
    }
    return matchedColumns;
  },

  /**
    creating the new table with only 5 columns
    do this by going through each line of the old table
  **/
  createNewTable : function(matchedColumns){
    var newTable = new Array();
    var y = 0;
    this.model.forEach(function(row){
      var x = 0;
      var tempArray = new Array("" , "", "", "", "");
      row.forEach(function(cell){
        for (i=0; i<matchedColumns.length; i++) {
          if (x == matchedColumns[i]){
            tempArray[i] = cell;
          }
        }
        newTable[y] = tempArray;
        x++;
      });
      y++;
    });
    return newTable; 
  },

  /**
    Matches actors from the table to the actors in the database und saves the matched once
    as a new money connection 
  **/
  render: function(){
    var table = this;

    var matchedColumns = this.matchedColumnPosition();
    var newTable = this.createNewTable(matchedColumns);

    //Print out the headlines
    this.$el.append(TableHeadline);

    var dbActors = this.dbActors;
    var headline = true;
    this.newMoneyConnections = new MoneyConnections();
    var newMoneyConnections = this.newMoneyConnections;

    dbActors.fetch({
      success: function(dbActors){

        var connections = new Array();

        //now create the table and find actors
        var indexCurrentRow = 0;
        var indexFoundActors = 0;
        var indexCurrentConnection = -1;
        
        var matchingActors = new Array();

        newTable.forEach(function(row){

          //Combine the columns and to the correct places
          var matchedActors = false;
          var bothMarked = false;
          var indexCurrentColumn = 0;

          //for each row in the CSV document get the column
          row.forEach(function(column){

            //go through each actor in the database for the provider and receiver cell
            if(indexCurrentColumn == 0 || indexCurrentColumn == 1){
              var addedColumn = false;
              dbActors.forEach(function(dbActor){
                
                //Found equal actor in database
                if(column == dbActor.get('name')){
                  matchedActors = true;
                  
                  if(indexCurrentColumn == 0)
                  {
                    matchingActors[indexFoundActors] = new Array('provider', dbActor.id, dbActor.get('name'), indexCurrentRow , indexCurrentColumn);
                  }
                  else if(indexCurrentColumn == 1)
                  {
                    
                    matchingActors[indexFoundActors] = new Array('recipient', dbActor.id, dbActor.get('name'), indexCurrentRow , indexCurrentColumn);

                    if(indexFoundActors > 0 && (matchingActors[indexFoundActors][3] == matchingActors[indexFoundActors-1][3]))
                    {
                      bothMarked = true;
                      indexCurrentConnection++;
                      connections[indexCurrentConnection] = new Array(matchingActors[indexFoundActors-1][1], matchingActors[indexFoundActors][1]);
                    }
                    
                  }

                  indexFoundActors++;    
                }
                
              });
            }

            if(bothMarked) {
              for (i=2; i<matchedColumns.length; i++) {
                if(indexCurrentColumn == matchedColumns[i]) {
                  connections[indexCurrentConnection][i] = column;
                }
              } 
            }

            indexCurrentColumn++;
            
          });
          
          var tableRow = new ImportTableRowView({ model : row});

          //Create new connection
          if(bothMarked)
          {
            tableRow.setMarkedActor();          
            var moneyConnection = table.createMoneyConnection(table.country,connections[indexCurrentConnection]);
            newMoneyConnections.add(moneyConnection);
          }

          tableRow.render();
          table.$el.append(tableRow.el);
          indexCurrentRow++
        });

      }
    });

  },

  /**
    Create a new money connection, which will be saved to the database
  **/
  createMoneyConnection : function(country,connections){
    var moneyConnection = new MoneyConnection({
          country: country,
          from: connections[0],
          to: connections[1],
          disbursed: connections[2],
          pledged: connections[3],
          source: connections[4]
    });
    return moneyConnection;
  }

});
