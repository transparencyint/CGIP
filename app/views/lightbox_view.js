var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),

  events: {
    'click #closeButton': 'closeLightbox',
    'click #lightbox': 'closeLightbox'
  },

  initialize: function(){    
    $('#lightbox-content').append(this.render().el);
  },  

  show: function(event){
    $('#lightbox').show();
  },

  closeLightbox: function(){  
    console.log('Closebutton clicked');
    $('#lightbox').hide();
  },

  afterRender: function(){
    //$('#actorEditor').bind('lightbox', this.show);
  }

});
