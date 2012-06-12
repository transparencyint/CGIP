var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),

  events: {
    'click #metadataClose': 'closeMetaData'
  },

  initialize: function(){ 
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
