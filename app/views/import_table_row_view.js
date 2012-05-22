var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_row'),
  
  tagName : 'tr',
  
  initialize: function(){
  },
  
  getRenderData : function(){
		return this.model;
  },

  afterRender: function(){
  }
});