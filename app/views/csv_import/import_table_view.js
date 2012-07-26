var View = require('views/view');
var Actors = require('models/actors');
var Import = require('models/import');
var ImportTableRowView = require('./import_table_row_view');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_table',
  
  tagName : 'table',
  className : 'import-table',

  initialize: function(){
  },

  render: function(){
    var table = this;
    var model = this.model;
    var headline = true;

        model.forEach(function(row){
          if(headline){
            headline=false;
            var tableHeadline = new ImportTableHeadlineView({model:row});
            tableHeadline.render();
            table.$el.append(tableHeadline.el);
          }
          var availableActor;

          var tableRow = new ImportTableRowView({ model : row, availableActor : availableActor});
          tableRow.render();
          table.$el.append(tableRow.el);

        });

      
    

  },
});
