var View = require('../view');
var RoleBackgroundView = require('../role_background_view');

module.exports = RoleBackgroundView.extend({

  className: 'roleBackgrounds',

  template: require('../templates/presentation/presentation_role_background'),

  events: {},
  
  initialize: function(options){
    this.editor = options.editor;
    this.country = this.editor.country;

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
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
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
    }

    // set the correct left value for the last draghandle
    newLeft = Math.floor(this.defaultRoleDimensions[4] + this.defaultRoleDimensions[4] * this.zoomValue);

    this.roleDimensions[4] = newLeft;

    // go through the role backgrounds and fix any gaps
    this.setDimensions();
  },

  pan: function(x, y){ 
    this.roleHolder.css('left', x);
    this.roleLabels.css('left', x);
  },

  toggleMonitoring: function(){

    // depending on the zoom value we need to position the monitoring area after the implementation role
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

      this.country.set({'showMonitoring' : true});
      this.country.save();
    }
  },

  render: function(){
    var editor = this;

    this.$el.html( this.template() );
    this.roleHolder = this.$('.roleHolder');
    this.roleLabels = this.$('.roleLabels');

    this.roleDimensions = this.country.get('roleDimensions');
    this.defaultRoleDimensions = _.clone(this.country.get('roleDimensions'));

    //check if monitoring role is hidden and hide monitoring elements
    if(!this.country.get('showMonitoring')){
      this.$('.monitoring').css({'display': 'none'});
    }

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
      }
    }

  },

  destroy: function(){
    View.prototype.destroy.call(this);
  }
});