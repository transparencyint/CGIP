var View = require('./view');
var Import = require('models/import');
var ImportTableRowView = require('./import_table_row_view');

module.exports = View.extend({
  id: 'import_table',
  
  template: require('./templates/import_table'),
  tagName : 'table',

  initialize: function(){
  },
  
  render: function(){
    var table = this;
 
    this.model.forEach(function(model){
      var tableRow = new ImportTableRowView({ model : model });
      tableRow.render();
      table.$el.append(tableRow.el);
    });
  },
});
