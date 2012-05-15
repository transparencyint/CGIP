var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_headline'),
  
  className : '',
  tagName : 'tr',
  
  initialize: function(){
  },
  
  getRenderData : function(){
    return this.model;
  },
  
  afterRender: function(){
    this.$('th').droppable({
        drop: function(event,ui){
          console.log(event.srcElement.innerHTML);
          event.target.innerHTML = event.srcElement.innerHTML;
          console.log(event.target.innerHTML);
        }
      });
  }
});