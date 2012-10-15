var View = require('views/view');

module.exports = View.extend({
  
  template: require('views/templates/csv_import/import_table_row'),
  
  tagName : 'tr',
  
  getRenderData : function(){
		return this.model;
  },

  setMarkedActor: function(){
    $(this.el).addClass('matchedRow');
  },

});