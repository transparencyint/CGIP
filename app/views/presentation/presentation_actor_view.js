var View = require('../view');
var ActorView = require('../actor_view');
var PresentationActorDetailsView = require('views/presentation/presentation_actor_details_view');

module.exports = View.extend({
  selectable: true,

	template : require('views/templates/presentation/presentation_actor'),

	className : 'actor',

	events: function(){
    var _events = {
      'click' : 'dontUnselect'
    };
    
    _events[ this.inputDownEvent ] = 'inputDown';
    _events[ this.inputUpEvent ] = 'cancelLongPress';

    _events[ 'dblclick' ] = 'showDetails';

    return _events;
  },

	initialize: function(options){

		this.width = options.editor.actorWidth;
    this.height = options.editor.actorHeight;

    this.initOrganizationType();
    
  	_.bindAll(this, 'showDetails', 'select');
	},

	determineName: ActorView.prototype.determineName,
  getRenderData: ActorView.prototype.getRenderData,
	initOrganizationType: ActorView.prototype.initOrganizationType,
  updateCorruptionRisk: ActorView.prototype.updateCorruptionRisk,

  inputDown: function(event){
    // fire dragstart
    this.dragStart(event);
    
    // only enable the longpress for certain views and touch devices
    if(this.isDraggable && this.showDetails && Modernizr.touch)
      // set timer to show details (this gets intersected on mouseup or when the mouse is moved)
      this.longPressTimeout = setTimeout(this.showDetails, this.longPressDelay);
  },
  
  cancelLongPress: function(){
    clearTimeout(this.longPressTimeout);
  },
  
  dontUnselect: function(event){
    event.stopPropagation();
  },

  disableDraggable: function(){
    this.isDraggable = false;
  },

  enableDraggable: function(){
    this.isDraggable = true;
  },
  
  dontDrag: function(event){
    event.stopPropagation();
  },

  dragStart: function(event){
    if(this.model && this.model.isLocked()) return;

    if(this.model && this.model.lockable)
      this.model.lock();
    
    this.select();
    
    event.stopPropagation();
    event.preventDefault();

    if(this.isDraggable){
      
      this.dragDistance = 0;
      this.wasOrIsDragging = false;
      this.isDragging = false;
      
      var pos = this.model.get('pos');
      
      this.startX = this.normalizedX(event) - pos.x;
      this.startY = this.normalizedY(event) - pos.y;
    
      $(document).on(this.inputMoveEvent, this.drag);
      $(document).one(this.inputUpEvent, this.dragStop);
    }
  },

  drag: function(event){ 
    var pos = this.model.get('pos');
    
    var dx = (this.normalizedX(event) - pos.x - this.startX) / this.editor.zoom.value;
    var dy = (this.normalizedY(event) - pos.y - this.startY) / this.editor.zoom.value;
    
    if(!this.wasOrIsDragging){
      this.dragDistance += Math.sqrt(dx*dx + dy*dy);

      if(this.dragDistance > this.dragThreshold){
        this.trigger('dragging');
        this.wasOrIsDragging = true;
        this.isDragging = true;
      }
    }

    this.dragByDelta(dx, dy);

    // emit a global drag event
    $(document).trigger('viewdrag', this);
  },
  
  dragByDelta: function(dx, dy){
    throw('dragByDelta is not implemented.')
  },

  updatePosition: function(){
    var pos = this.model.get('pos');
    this.$el.css(Modernizr.prefixed('transform'), 'translate3d('+ pos.x +'px,'+ pos.y +'px,0)');
  },
  
  dragStop : function(){
    if(this.model && this.model.lockable)
      this.model.unlock();

    if(this.wasOrIsDragging){
      // emit a global dragstop event
      $(document).trigger('viewdragstop', this);

      this.snapToGrid();
      this.wasOrIsDragging = false;
    }
      
    $(document).off(this.inputMoveEvent, this.drag);
  },

	showDetails: function(){
    console.log('showing details');
    this.modal = new PresentationActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
    this.options.editor.$el.append(this.modal.render().el);
  },

  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },

	afterRender: function(){
		this.updatePosition();
    this.updateCorruptionRisk();
    this.$el.attr('id', this.model.id);
  },

});