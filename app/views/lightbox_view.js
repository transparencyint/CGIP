var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),

  events: {
    'click #overlay': 'closeLightbox'
  },

  initialize: function(){ 
  },  

  show: function(event){
    $('#overlay').show();
    $('#lightbox').show();
  },

  closeLightbox: function(){  
    //console.log('Closebutton clicked');
    $('#lightbox').hide();
    $('#overlay').hide();
  },

  afterRender: function(){

    $('#overlay').click(function(){
      $('#lightbox').hide();
      $('#overlay').hide();
    });    
    //$('#actorEditor').bind('lightbox', this.show);
  }

});
