var View = require('views/view');
var Actors = require('models/actors');
var ImportTableRowView = require('./import_table_row_view');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_table',
  
  tagName : 'table',

  /**
    Shows the table from the CSV data and make droppable table headlines 
  **/
  render: function(){
    var table = this;
    var csvdata = this.model;
    var headline = true;

        csvdata.forEach(function(row){
          if(headline){
            headline=false;
            var tableHeadline = new ImportTableHeadlineView({model : row});
            tableHeadline.render();
            table.$el.append(tableHeadline.el);
          }

          var tableRow = new ImportTableRowView({model : row});
          tableRow.render();
          table.$el.append(tableRow.el);

        });

  },
});
