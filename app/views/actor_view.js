var View = require('./view');
var LightboxView = require('./lightbox_view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: {
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'saveOnEnter',
    'mousedown .inner': 'select',
    'dblclick' : 'showMetadataForm',
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

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('change:pos', this.updatePosition, this);
    this.model.on('change:role', this.drawRoleBorders, this);
    this.model.on('destroy', this.modelDestroyed, this);
  },

  showMetadataForm: function(){
    this.lightboxView = new LightboxView({model : this.model});
    $(document.body).append(this.lightboxView.render().el);
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

  startEditName: function(event){
    event.stopPropagation();
    this.$el.addClass('editingName');
    this.dontDrag = true;

    var input = this.$('.nameInput');
    var divText = $(this.$('.name')).text();
    input.val($.trim(divText));
    input.focus();
    input.select();
  },
  
  stopEditName: function(event){
    //event.preventDefault();
    //event.stopPropagation();
    console.log("Event: " + event.type);
    console.log("Event: " + event.currentTarget);
    console.log("stopEditName");
    this.$el.removeClass('editingName');
    var input = this.$('.nameInput');
    var newValue = input.val();
    var oldValue;
    
    var isAbbrev = (input.attr('placeholder') === "Abbrev");
    console.log("isAbbrev " + isAbbrev);
    if(isAbbrev){
      oldValue = this.model.get('abbreviation');
    }else{
      oldValue = this.model.get('name');
    }

    // this is needed here because enter and blur
    // trigger the event both
    if(oldValue !== newValue){
      if(isAbbrev)
        this.model.save({abbreviation: newValue});
      else
        this.model.save({name : newValue});
    }
    this.dontDrag = false;
    console.log(oldValue + " o-n " + newValue);
  },

  updateName: function(){
    var abbrev = this.model.get('abbreviation');
    var name = this.model.get('name');
    var div = this.$('.name');
    var input = this.$('.nameInput');
  
    if(abbrev !== ""){
      input.attr('placeholder', 'Abbrev');
      div.text(abbrev);
    }else if(name !== ""){
      input.attr('placeholder', 'Name');
      div.text(name);
    }else {
      input.attr('placeholder', 'Abbrev');
      div.text("New Actor");
    }
    console.log(abbrev + " abb-name " + name);
  },
  
  saveOnEnter: function(event){
    if(event.keyCode === 13){
      //event.preventDefault();
      //event.stopPropagation();
      if(this.$el.hasClass('editingName')){
        console.log("saveOnEnter");
        //this.stopEditName(event);
        
        $(this.$('.nameInput')).blur();
        //this.unbind('blur .nameInput');
        //$(this.$('.nameInput')).focusout();
      }
    }
  },

  modelDestroyed: function(){
    this.$el.remove();
  },
  
  dragStart: function(event){
    if(!this.dontDrag){
      event.stopPropagation();
      
      var pos = this.model.get('pos');
      
      this.startX = event.pageX - pos.x;
      this.startY = event.pageY - pos.y;
    
      $(document).on('mousemove.global', this.drag);
      $(document).one('mouseup', this.dragStop);
    }
  },

  drag: function(event){ 
    var pos = this.model.get('pos');
    
    var dx = (event.pageX - pos.x - this.startX) / this.editor.zoom.value;
    var dy = (event.pageY - pos.y - this.startY) / this.editor.zoom.value;
    
    this.editor.dragGroup(dx, dy);
  },
  
  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },
  
  dragStop : function(){
    this.snapToGrid();    
    $(document).unbind('mousemove.global');
  },
  
  snapToGrid: function(){
    //make drag available along a simple grid
    var gridSize = this.editor.gridSize;
    var pos =  this.model.get('pos');     

    //move the actor to the nearest grid point
    var x = Math.round(pos.x / gridSize) * gridSize;
    var y = Math.round(pos.y / gridSize) * gridSize;
    
    var dx = x - pos.x;
    var dy = y - pos.y;
    
    if(dx !== 0 || dy !== 0){
      var editor = this.editor;

      $({percent: 0}).animate({percent: 1}, {
        step: function(){
          var stepX = this.percent * dx;
          var stepY = this.percent * dy;

          editor.dragGroup(stepX, stepY);

          dx -= stepX;
          dy -= stepY;
        },
        duration: 100,
        complete: function(){
          editor.saveGroup();
        }
      });
    } else {
      this.editor.saveGroup();
    }
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    var name = this.model.get('name');
    
    this.updatePosition();

    this.$el.attr('id', this.model.id);

    this.nameElement = this.$el.find('.name');

    this.drawRoleBorders();
  },

  drawRoleBorders: function(){
    var roles = this.model.get('role');
    var el = this.$el;

    // remove all previous paths and circles
    el.find('.svg-holder circle, .svg-holder path').remove();
    
    if(roles && roles.length > 0){
      var width =  130;
      var height = 130;
      
      el.find('.svg-holder').svg({settings:{'class': 'actor-svg'}});  
      var svg = el.find('.svg-holder').svg('get'); 

      /* if there is just one role we drwa a svg circle */
      if(roles.length == 1){
        var drawnPath = svg.circle(width/2, width/2, width/2, {
            strokeWidth: 1
          });
        $(drawnPath).attr({'class': roles[0], transform: 'translate(-5 -5)'});
      } else {
        var percent = 100 / roles.length;
        var angles = percent * 360 / 100;
        var startAngle = 0;
        var endAngle = 0;

        $.each(roles, function(role, roleValue){
          startAngle = endAngle;
          endAngle = startAngle + angles;

          x1 = parseInt(width/2 + ((width/2))*Math.cos(Math.PI*startAngle/180));
          y1 = parseInt(height/2 + ((height/2))*Math.sin(Math.PI*startAngle/180));

          x2 = parseInt(width/2 + ((width/2))*Math.cos(Math.PI*endAngle/180));
          y2 = parseInt(height/2 + ((height/2))*Math.sin(Math.PI*endAngle/180));                

          var path = svg.createPath();
          var drawnPath = svg.path(
            path.move(width/2, height/2).
            line(x1, y1).
            arc((width/2), (height/2), 0, 0, true, x2, y2).
            close(), {
              strokeWidth: 1,
              transform: 'translate(5 -5), rotate(90, 60, 60)'
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