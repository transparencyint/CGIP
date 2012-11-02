var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/metadata'),
  
  className : 'actor hasContextMenu',

  events: {
    'click': 'showMetadata',
    'mouseout': 'hideMetadata'
  },
  
  initialize: function(options){
    this.editor = options.editor;
    this.model.on('change', this.metadataChanged, this);

    this.contextmenu = new ContextMenuView({model: this.model});
  },

  /**
    Model hase been changed
  */
  metadataChanged: function(){ 
    if(this.contextmenu && this.contextmenu.$el)
      this.contextmenu.destroy();
    this.render();
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },


  afterRender: function(){
    var name = this.model.get('name');

    this.showRoles();
    this.updatePosition();

    this.$el.attr('id', this.model.id);

    // only add the draggable if it's not already set
    if(!this.$el.hasClass('ui-draggable'))
      this.$el.draggable({
        stop: this.stopMoving,
        drag: this.drag,
        zIndex: 2
      });

    this.nameElement = this.$el.find('.name');

    this.$el.append(this.contextmenu.render().el);
  },

  showMetadata: function(event){ 
    if(!this.$el.hasClass('activeOverlay') && this.$el.find('.overlay').html().trim())
    {
      this.$el.find('.overlay').fadeIn(200);
      this.$el.addClass('activeOverlay');
    }
    //return false;
  },

  hideMetadata: function(event){   
    if(this.$el.hasClass('activeOverlay'))
    {
      this.$el.find('.overlay').fadeOut(200);
      this.$el.removeClass('activeOverlay');
    }
      
  }
});