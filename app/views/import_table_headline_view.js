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
        accept: "#headlines li",
        drop: function(event,ui){
          event.target.innerHTML = ui.draggable.text();
          ui.draggable.hide(200);
          //event.target.innerHTML = event.srcElement.innerHTML;
        }
      });
  }
});