var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/contextmenu'),
  tagName: 'ul',
  className: 'contextMenu',

  events: {
    'click .delete': 'deleteClicked'
  },

  initialize: function(){
    _.bindAll(this, 'show');
  },

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

  deleteClicked: function(){  
    if(this.model) this.model.destroy();
  },

  afterRender: function(){
    this.options.parent_el.bind('contextmenu', this.show);
  }

});
