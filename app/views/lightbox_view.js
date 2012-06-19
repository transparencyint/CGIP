var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),

  events: {
    'click #metadataClose': 'closeMetaData',
    'change .hasOther': 'showInput'
  },

  initialize: function(){ 
    $('.hasOther').change(function(){

      var hiddenBrother = $(this).next();
      if( this.value === "other" ){
        hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
    });

  },  

  showInput: function(event){

    console.log(event);
    var hiddenBrother = $(event.target.nextElementSibling);
      if(event.target.value === "other" ){
        hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
  },

  show: function(event){
    $('#lightbox').show();
  },

  closeMetaData: function(){ 
    $('#lightbox').hide();
  
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    
    
    
    //$('#lightbox').click(function(){
      
    //});    
    //$('#actorEditor').bind('lightbox', this.show);
  }

});
