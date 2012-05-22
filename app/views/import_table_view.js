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

    this.model.forEach(function(model){
      if(headline){
        headline=false;
        var tableHeadline = new ImportTableHeadlineView({model:model});
        tableHeadline.render();
        table.$el.append(tableHeadline.el);
      }

      var tableRow = new ImportTableRowView({ model : model });
      tableRow.render();
      table.$el.append(tableRow.el);

    });

    var collection = new Actors();
      collection.fetch({
        success: function(){
          collection.forEach(function(model){
            table.$el.append(model.get('name'));
          });
        }
      });
  },
});
