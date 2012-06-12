var View = require('./view');
var ContextMenuView = require('./contextmenu_view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor hasContextMenu',

  events: {
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'mousedown': 'select'
  },
  
  initialize: function(options){
    _.bindAll(this, 'stopMoving', 'drag');

    this.editor = options.editor;
    this.model.on('change:name', this.render, this);
    this.model.on('change:pos', this.updatePosition, this);
    this.model.on('change:zoom', this.updateZoom, this);
    this.model.on('destroy', this.modelDestroyed, this);

    this.contextmenu = new ContextMenuView({model: this.model, parent_el: this.$el});
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
    this.editor.actorSelected(this);
  },

  startEditName: function(event){
    this.$el.addClass('editingName');
    this.$el.draggable('disable');
    this.$('.nameInput').focus();
  },
  
  stopEditName: function(event){
    this.$el.removeClass('editingName');
    var newValue = this.$('.nameInput').val();
    var oldName = this.model.get('name');
    // this is needed here because enter and blur
    // trigger the event both
    if(oldName !== newValue)
      this.model.save({name: newValue});
    this.$el.draggable('enable');
  },
  
  saveOnEnter: function(event){
    if(event.keyCode === 13){
      event.preventDefault();
      this.stopEditName(event);
    }
  },

  modelDestroyed: function(){
    this.$el.remove();
  },
  
  stopMoving : function(){
    this.model.save(this.getPosition());
  },

  drag: function(event){
    var pos = this.model.get('pos');
    var newPos = this.getPosition();
    var delta = { x: newPos.pos.x - pos.x, y: newPos.pos.y - pos.y };
    this.editor.dragGroup(delta);
  },

  getPosition : function(event){
    return { 
      'pos' : {
        x : this.$el.offset().left + this.$el.outerWidth()/2,
        y : this.$el.offset().top + this.$el.outerWidth()/2
      }
    };
  },

  updatePosition: function(){
    var pos = this.model.get('pos');
    this.$el.css({
      left : pos.x,
      top : pos.y
    });
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var name = this.model.get('name');
    
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
  }
});