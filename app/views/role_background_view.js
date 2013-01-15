var View = require('./view');

module.exports = View.extend({

  className: 'roleBackgrounds',

  template: require('./templates/role_background'),

  events: {
    'mousedown .draghandle': 'dragRoleHandle'
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

    _.bindAll(
      this, 
      'dragRoleHandleStart', 
      'dragRoleHandleStop'
    );
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },

  dragRoleHandle: function(event){
    event.stopPropagation();

    this.roleAreaOffsets.draghandleLeft = event.pageX;
    
    $(document).on('mousemove.draghandle', {
      roleSelector: $(event.currentTarget).attr('rel') }, 
      this.dragRoleHandleStart
    );

    $(document).one('mouseup', {
      roleSelector: $(event.currentTarget).attr('rel') }, 
      this.dragRoleHandleStop
    );
  },

  dragRoleHandleStart: function(event){

    // get the current drag x coordinate
    var roleSelector = event.data.roleSelector;
    var roleIndex = this.roles.indexOf(roleSelector);
    var isDraggable = true;
    var deltaXAbsolute = this.roleAreaOffsets.draghandleLeft - event.pageX;

    this.roleAreaOffsets.draghandleLeft = event.pageX;

    // check if the dimensions are larger then the minimum role width

    /*
    if(roleIndex > 0 && roleIndex != -1){
      if(this.defaultRoleDimensions[roleIndex] - this.defaultRoleDimensions[roleIndex-1] - deltaXAbsolute < this.minRoleWidth){  
        isDraggable = false;
      }else if(this.defaultRoleDimensions[roleIndex] - deltaXAbsolute > this.defaultRoleDimensions[roleIndex+1] - this.minRoleWidth){ 
        // check if monitoring is inactive
        if(roleIndex == 3 && !this.$('#monitoring').is(':visible')){
          console.log('hidden monitoring');
          isDraggable = true;
        }else
          isDraggable = false;
      }
    }else if(roleIndex == 0){
      if(this.defaultRoleDimensions[0] - deltaXAbsolute > this.defaultRoleDimensions[1] - this.minRoleWidth){ 
        isDraggable = false;
      }
    }else{
      if(this.defaultRoleDimensions[4] - this.defaultRoleDimensions[3] - deltaXAbsolute < this.minRoleWidth){
        isDraggable = false;
      }
    } 
    */

    
    if(isDraggable){

      // the draghandles define the positions and widths of the role backgrounds
      // save the dimensions when they are dragged
      for(var i=0; i<this.roleDimensions.length; i++){
        this.roleDimensions[i] = Math.floor(this.defaultRoleDimensions[i] + this.defaultRoleDimensions[i] * this.zoomValue)
      }

      // calculate with the initial role dimensions to prevent unwanted data shift
      if(roleSelector == 'last')
        this.defaultRoleDimensions[4] = Math.floor( this.defaultRoleDimensions[4] - deltaXAbsolute );
      else
        this.defaultRoleDimensions[roleIndex] = Math.floor( this.defaultRoleDimensions[roleIndex] - deltaXAbsolute );
      
      this.setDimensions();
    }
  },

  dragRoleHandleStop: function(event){
    this.country.set({'roleDimensions' : this.defaultRoleDimensions});
    this.country.save();

    $(document).unbind('mousemove.draghandle');
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
        console.log('smaller');
        this.roleDimensions[4] = this.roleDimensions[3] + this.minRoleWidth;
      }
      this.$('.monitoring').css({
        'left': this.roleDimensions[2] + $('#implementation').width(),
        'width': this.roleDimensions[4] - this.roleDimensions[3]
      });

      this.$('.monitoring').show();

      //fix for the last draghandle
      this.$('.draghandle.last').css({
        'left': $('#monitoring').position().left + $('#monitoring').width()
      });

      this.$('.draghandle.last').show();

      this.roleDimensions[4] = $('#monitoring').position().left + $('#monitoring').width();
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
        var newWidth = this.roleDimensions[i+1] - roleLeft;

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

  destroy: function(){
    View.prototype.destroy.call(this);
  }
});