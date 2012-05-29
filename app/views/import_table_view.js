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
    var dbActors = this.dbActors;
    var headline = true;

    dbActors.fetch({
      async: false,
      success: function(dbActors){

        model.forEach(function(row){
          if(headline){
            headline=false;
            var tableHeadline = new ImportTableHeadlineView({model:row});
            tableHeadline.render();
            table.$el.append(tableHeadline.el);
          }

          var availableActor;
          var matchedActors = false;

          row.forEach(function(entry){
            var foundActor = "";

            table.dbActors.forEach(function(dbActor){
              if(entry == dbActor.get('name'))
              {
                matchedActors = true;
                foundActor = entry;
                console.log('Found', entry, dbActor.get('name'));
              }
            });
          });

          var tableRow = new ImportTableRowView({ model : row, availableActor : availableActor});
          
          if(matchedActors)
            tableRow.setMarkedActor();

          tableRow.render();
          table.$el.append(tableRow.el);

        });

      }
    });

  },
});
