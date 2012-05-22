var View = require('./view');
var Actors = require('models/actors');
var Import = require('models/import');
var ImportTableRowView = require('./import_table_row_view');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_table',
  
  template: require('./templates/import_table'),
  tagName : 'table',
  className : 'import-table',

  initialize: function(){
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  render: function(){

    var table = this;
    var headline = true;

    var dbActors = new Actors();
    
    var dbActorNames = new Array();

    dbActors.fetch({
        success: function(){
          dbActors.forEach(function(dbActor){
            dbActorNames.push(dbActor.get('name'));
            //HIER SIND DIE NAMEN AUS DER DB NOCH VORHANDEN!!!
            //console.log(dbActor.get('name'));
          });
        }
    });

//HIER SIND DIE NAMEN AUS DER DB NICHT MEHR VORHANDEN?!?!
console.log(dbActorNames);

    this.model.forEach(function(row){
      if(headline){
        headline=false;
        var tableHeadline = new ImportTableHeadlineView({model:row});
        tableHeadline.render();
        table.$el.append(tableHeadline.el);
      }

      var availableActor;
      row.forEach(function(entry){
          if(row[0] == entry){
            console.log("E "+entry);
            //console.log(dbActorNames);
            for(var i = 0; i < dbActorNames.length; i++) {
              if(entry == dbActorNames[i]){
                
                  availableActor = entry;
              }
            }
          }
      });

      //console.log(availableActor);

      var tableRow = new ImportTableRowView({ model : row, availableActor : availableActor});
      tableRow.render();
      table.$el.append(tableRow.el);

    });

    
  },
});
