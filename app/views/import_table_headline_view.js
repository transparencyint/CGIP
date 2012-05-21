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
        hoverClass: "state-hover",
        over: function(event,ui){
          var idx = $(this).parent().children().index(this);

          $("#import_table").find("td").each(function(){
              if($(this).index() == idx)
                $(this).addClass("state-hover");
          });          
        },
        out: function(event,ui){
          $("#import_table").find("td").each(function(){
              $(this).removeClass("state-hover");
          });
        },
        drop: function(event,ui){
          event.target.innerHTML = ui.draggable.text();
          ui.draggable.hide(200);
          //event.target.innerHTML = event.srcElement.innerHTML;
        }
      });
  }
});