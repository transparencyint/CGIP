var View = require('./view');

module.exports = View.extend({

  className: 'roleBackgrounds',

  template: require('./templates/role_background'),

  events: function(){
    var _events = {};
    
    _events[ this.inputDownEvent + ' .draghandle' ] = 'dragStart';
    
    return _events;
  },
  
  initialize: function(options){
    this.editor = options.editor;
    this.country = this.editor.country;

    this.roleAreaOffsets = {
      draghandleLeft: 0
    }

    // define which roles there are
    this.roles = ['funding', 'coordination', 'implementation', 'monitoring'];

    // store the widths of the roles if the change (needed for zooming)
    this.roleBackgroundWidths = [];

    // presave the initial role x dimensions for drag calculation
    this.defaultRoleDimensions = [];

    // current zoom value 
    this.zoomValue = 0.0;

    // listen to zoom and pan events fired by actor editor
    this.editor.on('zoom', this.zoom, this);
    this.editor.on('pan', this.pan, this);

    // the minimum width of a role background
    this.minRoleWidth = 182;

    this.dragOver = null; 

    _.bindAll(
      this, 
      'drag', 
      'dragStop',
      'setActorRole'
    );
  },

  setActorRole: function(actor){
    console.log(actor.attributes.pos.x);
  },

  dragStart: function(event){
    event.preventDefault();
    event.stopPropagation();

    this.roleAreaOffsets.draghandleLeft = this.normalizedX(event);
    
    $(document).on( this.inputMoveEvent, 
      {
        roleSelector: $(event.currentTarget).attr('rel') 
      }, 
      this.drag
    );

    $(document).one(this.inputUpEvent, this.dragStop);
  },

  drag: function(event){

    $('#actorEditor').addClass('dragcursor');

    // get the current drag x coordinate
    var roleSelector = event.data.roleSelector;
    var roleIndex = this.roles.indexOf(roleSelector);
    var isDraggable = true;
    var inputX = this.normalizedX(event);
    var deltaXAbsolute = this.roleAreaOffsets.draghandleLeft - inputX;

    this.dragOver = null;
    this.roleAreaOffsets.draghandleLeft = inputX;

    // check if the dimensions are larger then the minimum role width
    if(roleIndex > 0 && roleIndex != -1){
      if(this.defaultRoleDimensions[roleIndex] - this.defaultRoleDimensions[roleIndex-1] - deltaXAbsolute < this.minRoleWidth){  

        this.dragOver = 'left';
      }else if(this.defaultRoleDimensions[roleIndex] - deltaXAbsolute > this.defaultRoleDimensions[roleIndex+1] - this.minRoleWidth){ 
        
        this.dragOver = 'right';
      }
      isDraggable = true;
    }else if(roleIndex == 0){
      if(this.defaultRoleDimensions[0] - deltaXAbsolute > this.defaultRoleDimensions[1] - this.minRoleWidth){ 
        isDraggable = false;
      }
    }else{
      if(this.defaultRoleDimensions[4] - this.defaultRoleDimensions[3] - deltaXAbsolute < this.minRoleWidth){
        isDraggable = false;
      }
    }

    if(isDraggable){

      // calculate with the initial role dimensions to prevent unwanted data shift
      // we need to use float values here in order to prevent role area shifts
      if(roleSelector == 'last')
        this.defaultRoleDimensions[4] = this.defaultRoleDimensions[4] - deltaXAbsolute;
      else {

        this.defaultRoleDimensions[roleIndex] = this.defaultRoleDimensions[roleIndex] - deltaXAbsolute + (deltaXAbsolute - deltaXAbsolute*this.editor.zoom.sqrt);
        
        if(roleIndex > 0){
          if(this.dragOver == 'left'){
            // move all previous roles to the left
            for(var i=0; i<roleIndex; i++){
               this.defaultRoleDimensions[i] = this.defaultRoleDimensions[i] - deltaXAbsolute + (deltaXAbsolute - deltaXAbsolute*this.editor.zoom.sqrt);   
            }
          }
          else if(this.dragOver == 'right'){
            // move all next roles to the right
            for(var i=roleIndex+1; i<this.defaultRoleDimensions.length; i++){
              this.defaultRoleDimensions[i] = this.defaultRoleDimensions[i] - deltaXAbsolute + (deltaXAbsolute - deltaXAbsolute*this.editor.zoom.sqrt);   
            }
          }
        }
      }
        
      
      // the draghandles define the positions and widths of the role backgrounds
      // save the dimensions when they are dragged
      for(var i=0; i<this.roleDimensions.length; i++){
        this.roleDimensions[i] = Math.floor(this.defaultRoleDimensions[i] + this.defaultRoleDimensions[i] * this.zoomValue);
      }

      this.setDimensions();
    }
  },

  dragStop: function(event){
    this.country.set({'roleDimensions' : this.defaultRoleDimensions});
    this.country.save();

    $(document).unbind(this.inputMoveEvent, this.drag);
    $('#actorEditor').removeClass('dragcursor');
  },

  zoom: function(zoomValue){

    // change the width of the role backgrounds depending on the zoom value
    // shift the x position of the role backgrounds
    this.zoomValue += zoomValue;

    for(var i=0; i<this.roles.length; i++){

      var width = this.$('#'+this.roles[i]).width();
      var newWidth = Math.floor(width + this.roleBackgroundWidths[i] * this.zoomValue);

      var newLeft = Math.floor(this.defaultRoleDimensions[i] + this.defaultRoleDimensions[i] * this.zoomValue);

      this.roleDimensions[i] = newLeft;

      this.$('.'+this.roles[i]).css({
        'width': Math.floor(newWidth),
        'left': newLeft
      });

      this.$('.draghandle[rel='+this.roles[i]+']').css({'left': newLeft});
    }

    // set the correct left value for the last draghandle
    newLeft = Math.floor(this.defaultRoleDimensions[4] + this.defaultRoleDimensions[4] * this.zoomValue);

    this.$('.draghandle.last').css({'left': newLeft});
    this.roleDimensions[4] = newLeft;

    // go through the role backgrounds and fix any gaps
    this.setDimensions();
  },

  pan: function(x, y){ 
    this.roleHolder.css('left', x);
    this.roleLabels.css('left', x);
    this.dragHandleBars.css('left', x);
  },

  toggleMonitoring: function(){

    //depending on the zoom value we need to position the monitoring area after the implementation role

    if(this.$('#monitoring').is(':visible')){
      this.$('.monitoring').hide();
      this.$('.draghandle.last').hide();
      
      this.country.set({'showMonitoring' : false});
      this.country.save();
    }else{
      if(this.roleDimensions[4] - this.roleDimensions[3] < this.minRoleWidth){
        this.roleDimensions[4] = this.roleDimensions[3] + this.minRoleWidth*2;
        this.defaultRoleDimensions[4] = this.defaultRoleDimensions[3] + this.minRoleWidth*2;
      }
      this.$('.monitoring').css({
        'left': this.roleDimensions[2] + $('#implementation').width(),
        'width': this.roleDimensions[4] - this.roleDimensions[3]
      });

      this.$('.monitoring').show();

      //fix for the last draghandle
      this.$('.draghandle.last').css({
        'left': this.roleDimensions[4]
      });

      this.$('.draghandle.last').show();

      this.country.set({'showMonitoring' : true});
      this.country.save();
    }
  },

  render: function(){
    var editor = this;

    this.$el.html( this.template() );
    this.roleHolder = this.$('.roleHolder');
    this.roleLabels = this.$('.roleLabels');
    this.dragHandleBars = this.$('.dragHandleBars');

    this.roleDimensions = this.country.get('roleDimensions');
    this.defaultRoleDimensions = _.clone(this.country.get('roleDimensions'));

    this.setDimensions();

    return this.$el;
  },

  setDimensions: function(){

    // iterate through all roles and set their dimensions
    // we also take care of the zoom factor
    for(var i=0; i<this.roleDimensions.length; i++){

      var roleLeft = this.roleDimensions[i];

      if(i < this.roleDimensions.length-1){
          
        // fix the min width
        var newWidth = Math.floor(this.roleDimensions[i+1] - roleLeft);

        this.$('.'+this.roles[i]).css({
          'width': newWidth,
          'left': roleLeft
        });

        this.roleBackgroundWidths[i] = this.roleDimensions[i+1] - roleLeft;
      }else{
        this.$('.draghandle.last').css({'left': roleLeft});
      }
      this.$('.draghandle[rel='+this.roles[i]+']').css({'left': roleLeft});
    }

  },

  /**
   * Get the actor role(s) after the user dragged an actor and return it as array
   * There can be maximum two roles after a drag. 
   * If the user dropped the actor outside a role background roles will be removed
   */
  getActorRoles: function(view){
    var viewPos = view.model.get('pos');
    var viewWidth = view.$el.outerWidth();
    var viewLeft = (viewPos.x - viewWidth / 2) * this.editor.zoom.value;
    var viewRight = (viewPos.x + viewWidth / 2) * this.editor.zoom.value;

    var newRoles = [];

    //go through the role dimensions and check if the view position is in there
    for(var i=0; i<this.defaultRoleDimensions.length; i++){

      var roleLeft = this.defaultRoleDimensions[i] * this.editor.zoom.value;
      
      if(i < this.defaultRoleDimensions.length){
          
        var roleWidth = Math.floor(this.defaultRoleDimensions[i+1] * this.editor.zoom.value - roleLeft);

        // role found for left side
        if(viewLeft > roleLeft && viewLeft < (roleLeft + roleWidth)){
          newRoles.push(this.roles[i]);
        }

        // role found for right side e.g. left side + width
        else if(viewRight > roleLeft && viewRight < (roleLeft + roleWidth)){
          newRoles.push(this.roles[i]);
        }
      }
    }
    return newRoles;
  },

  destroy: function(){
    View.prototype.destroy.call(this);
  }
});