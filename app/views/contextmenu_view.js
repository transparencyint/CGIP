var View = require('./view');
var LightboxView = require('./lightbox_view');

module.exports = View.extend({

  template: require('./templates/contextmenu'),
  tagName: 'ul',
  className: 'contextMenu list',

  events: {
    'click .delete': 'deleteClicked',
    'click .add': 'addClicked'
  },

  initialize: function(){
    _.bindAll(this, 'show');
    this.isDeletableOnly = false;
  },

  /**
    Show context menu at the right place
  */
  show: function(event){
    $('.contextMenu').removeClass('visible');
    if(event.button === 2){
      var offset = this.$el.parent('.hasContextMenu').offset();

      this.$el.addClass('visible').css({
        left : event.pageX - offset.left,
        top : event.pageY - offset.top
      });
      return false;
    }
  },


  deletableOnly: function(){
    this.isDeletableOnly = true;
  },

  deleteClicked: function(event){
    if(this.model) 
      this.model.destroy();
    //return false;
  },

  addClicked: function(event){
    //event.stopImmediatePropagation();
    //event.preventDefault();
    console.log("Add clicked "+event);
    $('#lightbox').empty();
    this.lightboxView = new LightboxView({model : this.model});
    $('#lightbox').append(this.lightboxView.render().el);
    this.lightboxView.show();
    this.$el.removeClass('visible');
    //return false;
  },

  afterRender: function(){
    if(this.isDeletableOnly){
      this.$('.add').remove();
      this.$('.delete').addClass('deletableOnly');
    }
  }

});
