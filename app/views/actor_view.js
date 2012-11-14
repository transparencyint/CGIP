var View = require('./view');
var ContextMenuView = require('./contextmenu_view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor hasContextMenu',

  events: {
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'mousedown .inner': 'select',
    'contextmenu .inner': 'showContextMenu',
    'mousedown': 'dragStart'
  },
  
  initialize: function(options){
    _.bindAll(this, 'dragStop', 'drag');

    this.editor = options.editor;
    this.width = this.editor.radius*2;
    this.height = this.editor.radius*2;
    this.dontDrag = false;

    this.editor.on('disableDraggable', this.disableDraggable, this);
    this.editor.on('enableDraggable', this.enableDraggable, this);

    this.model.on('change:name', this.updateName, this);
    this.model.on('change:pos', this.updatePosition, this);
    this.model.on('change:role', this.drawRoleBorders, this);
    this.model.on('destroy', this.modelDestroyed, this);

    this.contextmenu = new ContextMenuView({model: this.model});
  },

  
  showContextMenu: function(event){
    event.preventDefault();
    this.contextmenu.show(event);
  },

  disableDraggable: function(){
    this.dontDrag = true;
  },

  enableDraggable: function(){
    this.dontDrag = false;
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
    this.editor.actorSelected(this);
  },

  startEditName: function(){
    this.$el.addClass('editingName');
    this.dontDrag = true;
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
    
    this.dontDrag = false;
  },

  updateName: function(){
    this.$('.name').text(this.model.get('name'));
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
  
  dragStart: function(event){
    if(!this.dontDrag){
      event.stopPropagation();
      
      this.startX = event.pageX - this.offset.left;
      this.startY = event.pageY - this.offset.top;
    
      $(document).on('mousemove.global', this.drag);
      $(document).one('mouseup', this.dragStop);
    }
  },

  drag: function(event){ 
    var dx = (event.pageX - this.offset.left - this.startX) / this.editor.zoom.value;
    var dy = (event.pageY - this.offset.top - this.startY) / this.editor.zoom.value;
    
    this.offset.top += dy;
    this.offset.left += dx;
    
    this.editor.dragGroup(dx, dy);
    this.reposition();
  },
  
  reposition: function(){
    this.$el.css({
      left: this.offset.left,
      top: this.offset.top
    });
  },
  
  dragStop : function(){
    this.model.save({
      'pos' : { 
        x: this.offset.left,
        y: this.offset.top 
    }});
    
    $(document).unbind('mousemove.global');
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    var name = this.model.get('name');

    var pos = this.model.get('pos');
    this.offset = {
      left : pos.x,
      top : pos.y
    };
    this.reposition();

    this.$el.attr('id', this.model.id);

    this.nameElement = this.$el.find('.name');
    
    this.$el.append(this.contextmenu.render().el);

    this.drawRoleBorders();
  },

  drawRoleBorders: function(){
    var roles = this.model.get('role');
    var el = this.$el;

    // remove all previous paths and circles
    el.find('.svg-holder circle, .svg-holder path').remove();
    
    if(roles && roles.length > 0){
      var width = height = 120;
      
      el.find('.svg-holder').svg({settings:{'class': 'actor-svg'}});  
      var svg = el.find('.svg-holder').svg('get'); 

      /* if there is just one role we drwa a svg circle */
      if(roles.length == 1){
        var drawnPath = svg.circle(width/2, width/2, width/2, {
            strokeWidth: 1
          });
        $(drawnPath).attr('class', roles[0]);
      } else {
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

  destroy: function(){
    View.prototype.destroy.call(this);

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});