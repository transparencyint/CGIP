var View = require('views/view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('views/templates/csv_import/import_table_headline'),
  
  tagName : 'tr',
  
  initialize: function(){
  },
  
  getRenderData : function(){
    return this.model;
  },
  
  afterRender: function(){
    var headlineView = this;

    this.$('th').droppable({
        hoverClass: "state-hover",
        drop: function(event,ui){
          //check if there is a div element already
          var targetDivID = $(event.target).find("div").attr('id');
          var sourceDivID = $(ui.draggable).attr('id');
          if(targetDivID && (targetDivID != sourceDivID))
          {
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
          $(this).find("div").draggable({
            revert: true,
            revertDuration: 100
          });
          ui.draggable.hide(200);

          //check if all elements are moved to headlines
          //check if provider and recipient are moved to headlines
          setTimeout(function(){
            headlineView.checkHiddenstates();  
          }, 250);

        }
      });
  },

  checkHiddenstates: function(){

    var allHidden = true;

    if ($('#headlines #recipient').is(':visible'))
      allHidden = false;
    if ($('#headlines #provider').is(':visible'))
      allHidden = false;

    if(allHidden)
      $('#matchButton').css('display', 'block');
    else
      $('#matchButton').css('display', 'none');

  }
});