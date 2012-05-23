var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_headline'),
  
  tagName : 'tr',
  
  initialize: function(){
  },
  
  getRenderData : function(){
    return this.model;
  },
  
  afterRender: function(){
    this.$('th').droppable({
        drop: function(event,ui){
          event.target.innerHTML = event.srcElement.innerHTML;
        }
      });
  }
});