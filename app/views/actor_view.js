var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: {
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'click .delete': 'deleteClicked',
    'contextmenu': 'showContextMenue',
    'rightclick': 'showContextMenue'
  },
  
  initialize: function(){
    _.bindAll(this, 'stopMoving', 'drag');
    this.model.on('change:name', this.render, this);
    this.model.on('destroy', this.modelDestroyed, this);
  },
  
  showContextMenue: function(event){
    if(event.button === 2){
      this.$el.addClass('selected').siblings().removeClass('selected');
      this.$el.find('ul').css({
        left : event.pageX - this.$el.offset().left,
        top : event.pageY - this.$el.offset().top
      });
      return false;
    }
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

  saveName: function(name){

  },

  deleteClicked: function(){
    this.model.destroy();
  },

  modelDestroyed: function(){
    this.$el.remove();
  },
  
  stopMoving : function(){
    this.model.save(this.getPosition());
  },

  drag: function(event){
    this.model.set(this.getPosition());
  },

  getPosition : function(event){
    return { 
      'pos' : {
        x : this.$el.offset().left + this.$el.width()/2,
        y : this.$el.offset().top + this.$el.width()/2
      }
    };
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var pos = this.model.get('pos');
    var name = this.model.get('name');
    
    this.$el.css({
      left : pos.x,
      top : pos.y
    });

    // only add the draggable if it's not already set
    if(!this.$el.hasClass('ui-draggable'))
      this.$el.draggable({
        stop: this.stopMoving,
        drag: this.drag,
        zIndex: 2
      });

    this.nameElement = this.$el.find('.name');
  }
});