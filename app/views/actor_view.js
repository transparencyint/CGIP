var View = require('./view');
var ContextMenuView = require('./contextmenu_view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor hasContextMenu',

  events: {
    'click': 'showMetadata',
    'mouseout': 'hideMetadata',
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'mousedown': 'select'
  },
  
  initialize: function(options){
    _.bindAll(this, 'stopMoving', 'drag');

    this.editor = options.editor;
    this.model.on('change', this.metadataChanged, this);
    this.model.on('change:pos', this.updatePosition, this);
    this.model.on('change:zoom', this.updateZoom, this);
    this.model.on('destroy', this.modelDestroyed, this);

    //this.contextmenu = new ContextMenuView(parent_el: this.$el);
    this.contextmenu = new ContextMenuView({model: this.model, parent_el: this.$el});
  },

  /**
    Model hase been changed
  */
  metadataChanged: function(){ 
    if(this.contextmenu && this.contextmenu.$el)
      this.contextmenu.destroy();
    this.render();
    this.contextmenu = new ContextMenuView({model: this.model, parent_el: this.$el});
    //this.$el.append(this.contextmenu.render().el);
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
  
  /**
    Displays colored circle for each role. Every role has a defined color.
  */  
  checkRoles : function(roles){
    var actor = this;
    roles.forEach(function(role){
      switch(role) {
        case "funding":
          actor.$('#funding').css('background-color', 'red');
          break;
        case "coordination":
          actor.$('#coordination').css('background-color', 'silver');
          break;
        case "accreditation":
          actor.$('#accreditation').css('background-color', 'yellow');
          break;
        case "approval":
          actor.$('#approval').css('background-color', 'green');
          break;
        case "implementation":
          actor.$('#implementation').css('background-color', 'orange');
          break;
        case "monitoring":
          actor.$('#monitoring').css('background-color', 'blue');
          break;
        default:
          actor.$('.role:last').css('background-color', 'black');
      }
    });
  },

  showRoles: function(){
    var roles = this.model.get('role');
    if(roles != undefined){
      this.checkRoles(roles);
    }
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
    //this.contextmenu = new ContextMenuView({model: this.model, parent_el: this.$el});
    this.$el.append(this.contextmenu.render().el);
  },

  showMetadata: function(event){ 
    //event.preventDefault();
    console.log("meta clicked "+event);
    if(!this.$el.hasClass('activeOverlay') && this.$el.find('.overlay').html().trim())
    {
      this.$el.find('.overlay').fadeIn(0);
      this.$el.addClass('activeOverlay');
    }
    //return false;
  },

  hideMetadata: function(event){   
    if(this.$el.hasClass('activeOverlay'))
    {

      this.$el.find('.overlay').fadeOut(0);
      this.$el.removeClass('activeOverlay');
    }
      
  }
});