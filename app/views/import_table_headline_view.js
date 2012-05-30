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
        hoverClass: "state-hover",
        over: function(event,ui){
          var idx = $(this).parent().children().index(this);

          $("#import_table").find("td").each(function(){
              //if($(this).index() == idx)
                //$(this).addClass("state-hover");
          });          
        },
        out: function(event,ui){
          $("#import_table").find("td").each(function(){
              //$(this).removeClass("state-hover");
          });
        },
        drop: function(event,ui){

          //check if there is a div element already
          var targetDivID = $(event.target).find("div").attr('id');
          var sourceDivID = $(ui.draggable).attr('id');

          if(targetDivID && (targetDivID != sourceDivID))
          {
            console.log('found');
            $('#headlines li').each(function(){

                if($(this).attr('id') == targetDivID)
                  $(this).fadeIn(200);
            })
          }

          $(event.target).empty();

          $('#import_table th').each(function(){
            if($(this).find('div').attr('id') == $(ui.draggable).attr("id"))
            {
              $(this).find('div').remove();
              $(this).html('Drag Here');
            }
          });

          $(event.target).html("<div>" + $(ui.draggable).html() + "</div>");
          $(this).find("div").attr("id", $(ui.draggable).attr("id"));
          $(this).find("div").addClass("state-dragged");
          //$(this).find("div").removeClass("state-hover");
          $(this).find("div").draggable({
            revert: true,
            revertDuration: 100
          });
          ui.draggable.hide(200);
          //ui.draggable.remove();

          //check if all elements are moved to headlines
          var allHidden = true;
          $('#headlines li').each(function(){
            console.log($(this).is(':visible'));
            if($(this).is(':visible'))
              allHidden = false;
          });
          console.log(allHidden);

        }
      });
  }
});