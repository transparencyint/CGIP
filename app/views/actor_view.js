var View = require('./view');
var ContextMenuView = require('./contextmenu_view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor hasContextMenu',

  events: {

    //'click': 'showMetadata',
    //'mouseout': 'hideMetadata',

    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'mousedown': 'select',
    'contextmenu': 'showContextMenu'
  },
  
  initialize: function(options){
    _.bindAll(this, 'stopMoving', 'drag');

    this.editor = options.editor;

    this.editor.on('disableDraggable', this.disableDraggable, this);
    this.editor.on('enableDraggable', this.enableDraggable, this);

    this.model.on('change:name', this.render, this);
    this.model.on('change:pos', this.updatePosition, this);
    this.model.on('change:zoom', this.updateZoom, this);
    this.model.on('destroy', this.modelDestroyed, this);

    this.contextmenu = new ContextMenuView({model: this.model});
  },

  
  showContextMenu: function(event){
    console.log(event);
    event.preventDefault();
    this.contextmenu.show(event);
  },

  disableDraggable: function(){
    this.$el.draggable('disable');
  },

  enableDraggable: function(){
    this.$el.draggable('enable');
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
    this.editor.actorSelected(this);
  },

  startEditName: function(){
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
    var roles = this.model.get('role');

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

    this.drawRoleBorders(roles, this.$el);
  },

  drawRoleBorders: function(roles, el){
    if(typeof(roles) !== 'undefined'){
      
      var width = height = 120;
      
      el.find('.svg-holder').svg({settings:{'class': 'actor-svg'}});  
      var svg = el.find('.svg-holder').svg('get'); 

        /* if there is just one role we drwa a scg circle */
        if(roles.length == 1){
          var drawnPath = svg.circle(width/2, width/2, width/2, {
              strokeWidth: 1
            });
          $(drawnPath).attr('class', roles[0]);
        }
        else {

          var percent = 100 / roles.length;
          var angles = percent * 360 / 100;
          var startAngle = 0;
          var endAngle = 0;

          $.each(roles, function(role, roleValue){
            startAngle = endAngle;
            endAngle = startAngle + angles;

            x1 = parseInt(width/2 + ((width/2)-1)*Math.cos(Math.PI*startAngle/180));
            y1 = parseInt(height/2 + ((height/2)-1)*Math.sin(Math.PI*startAngle/180));

            x2 = parseInt(width/2 + ((width/2)-1)*Math.cos(Math.PI*endAngle/180));
            y2 = parseInt(height/2 + ((height/2)-1)*Math.sin(Math.PI*endAngle/180));                

            var path = svg.createPath();
            var drawnPath = svg.path(
              path.move(width/2, height/2).
              line(x1, y1).
              arc((width/2)-1, (height/2)-1, 0, 0, true, x2, y2).
              close(), {
                strokeWidth: 1,
                transform: 'rotate(90, 60, 60)'
              });

            $(drawnPath).attr('class', roleValue);

          });
        }
      }
  },

/*
  showMetadata: function(event){ 
    //event.preventDefault();
    console.log("meta clicked "+event);
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
   }, */

  destroy: function(){
    View.prototype.destroy.call(this);

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});