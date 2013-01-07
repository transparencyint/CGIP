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

    this.roles = ['funding', 'coordination', 'implementation', 'monitoring'];
    this.roleBackgroundWidths = [];
    this.zoomValue = 0.0;

    this.editor.on('zoom', this.zoom, this);
    this.editor.on('pan', this.pan, this);

    this.minRoleWidth = 46*2;

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

    this.startX = event.pageX - this.roleAreaOffsets.draghandleLeft;
    this.roleAreaOffsets.draghandleLeft = event.pageX;
    
    $(document).on('mousemove.draghandle', {roleSelector: $(event.currentTarget).attr('rel') }, this.dragRoleHandleStart);
    $(document).one('mouseup', {roleSelector: $(event.currentTarget).attr('rel') }, this.dragRoleHandleStop);
  },

  dragRoleHandleStart: function(event){
    // get the current drag x coordinate
    var fundingWidth = $('#funding').width();
    var coordinationWidth = $('#coordination').width();
    var newWidth = 0;
    var roleSelector = event.data.roleSelector;
    var roleIndex = this.roles.indexOf(roleSelector);

    var deltaXAbsolute = this.roleAreaOffsets.draghandleLeft - event.pageX;

    this.roleAreaOffsets.draghandleLeft = event.pageX;

    this.roleDimensions = [
      Math.floor($('.draghandle[rel=funding]').position().left),
      Math.floor($('.draghandle[rel=coordination]').position().left),
      Math.floor($('.draghandle[rel=implementation]').position().left),
      Math.floor($('.draghandle[rel=monitoring]').position().left),
      Math.floor($('.draghandle[rel=last]').position().left)
    ];



    if(roleIndex == 0){
      $('span[rel=funding]').css({
        'left': $('#funding').position().left - deltaXAbsolute, 
        'width': $('#funding').width() + deltaXAbsolute
      });
      $('#funding').css({
        'left': $('#funding').position().left - deltaXAbsolute, 
        'width': $('#funding').width() + deltaXAbsolute
      });
      
      this.roleBackgroundWidths[0] = $('#funding').width() + deltaXAbsolute;
    }
    else if(roleIndex != -1){
        newWidth = this.roleDimensions[roleIndex] - this.roleDimensions[roleIndex-1];
        $('#'+this.roles[roleIndex-1]).css({'width': newWidth});
        $('span[rel='+this.roles[roleIndex-1]+']').css({'width': newWidth});

        newWidth = this.roleDimensions[roleIndex+1] - this.roleDimensions[roleIndex];
        $('#'+roleSelector).css({'left': this.roleDimensions[roleIndex], 'width': newWidth});     
        $('span[rel='+roleSelector+']').css({'left': this.roleDimensions[roleIndex], 'width': newWidth});

        this.roleBackgroundWidths[roleIndex] = newWidth;
    }
    else {
      newWidth = $('#monitoring').width();
      $('#monitoring').css({'width': newWidth -= deltaXAbsolute});
      $('span[rel=monitoring]').css({'width': newWidth});
      
      this.roleBackgroundWidths[4] = newWidth;
    }

    // move the dragHandle 
    $('.draghandle[rel='+roleSelector+']').css({'left': $('.draghandle[rel='+roleSelector+']').position().left - deltaXAbsolute});
  },

  dragRoleHandleStop: function(event){

    // set the new roleArea coordinates and calculate the zoom factor out
    for(var i=0; i<this.roleDimensions.length; i++){
       //this.roleDimensions[i] =  Math.round(this.roleDimensions[i] - (this.roleDimensions[i] * this.zoomValue));
    }
    if(this.editor.zoom.value == 1.0){
      this.country.set({'roleDimensions' : this.roleDimensions});
      this.country.save();
    }

    $(document).unbind('mousemove.draghandle');
  },

  zoom: function(zoomValue){

    // change the width of the role backgrounds depending on the zoom value
    // shift the x position of the role backgrounds
    this.zoomValue = zoomValue;

    for(var i=0; i<this.roles.length; i++){
      var width = $('#'+this.roles[i]).width();
      var newWidth = Math.floor(width + this.roleBackgroundWidths[i] * zoomValue);
      var newLeft = Math.floor($('#'+this.roles[i]).position().left + this.roleDimensions[i] * zoomValue);

      $('#'+this.roles[i]).width(newWidth);
      $('#'+this.roles[i]).css({'left': newLeft});

      $('span[rel='+this.roles[i]+']').css({'width': Math.floor(newWidth)});
      $('span[rel='+this.roles[i]+']').css({'left': newLeft});

      $('.draghandle[rel='+this.roles[i]+']').css({'left': newLeft});
    }
    $('.draghandle[rel=last]').css({'left': Math.floor($('.draghandle[rel=last]').position().left + this.roleDimensions[4] * zoomValue)});


    //go through the role backgrounds and fix any gaps

    $('#funding').css({
      'width': $('#coordination').position().left - $('#funding').position().left
    });
    $('#coordination').css({
      'width': $('#implementation').position().left - $('#coordination').position().left
    });
    $('#implementation').css({
      'width': $('#monitoring').position().left - $('#implementation').position().left
    });
    $('#monitoring').css({
      'width': $('.draghandle[rel=last]').position().left - $('#monitoring').position().left
    });


    $('span[rel=funding]').css({
      'width': $('#coordination').position().left - $('#funding').position().left
    });
    $('span[rel=coordination]').css({
      'width': $('#implementation').position().left - $('#coordination').position().left
    });
    $('span[rel=implementation]').css({
      'width': $('#monitoring').position().left - $('#implementation').position().left
    });
    $('span[rel=monitoring]').css({
      'width': $('.draghandle[rel=last]').position().left - $('#monitoring').position().left
    });


    /*
    for(var i=0; i<this.roles.length; i++){
      if(i != 0){
        $('#'+this.roles[i]).css({
          'left': $('#'+this.roles[i-1]).position().left + $('#'+this.roles[i]).width()
        });
      }
    }
    */
    
  },


  pan: function(x, y){ 
    this.roleHolder.css('left', x);
    this.roleLabels.css('left', x);
    this.dragHandleBars.css('left', x);
  },

  toggleMonitoring: function(){
    if($('#monitoring').is(':visible')){
      $('#monitoring').hide();
      $('.draghandle.last').hide();
      $('span[rel=monitoring]').hide();

      this.country.set({'showMonitoring' : false});
      this.country.save();
    }else{
      $('#monitoring').show();
      
      //fix for the last draghandle
      $('.draghandle.last').css({'left': $('#monitoring').position().left + $('#monitoring').width()});
      $('.draghandle.last').show();
      $('span[rel=monitoring]').show();

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

    for(var i=0; i<this.roleDimensions.length; i++){
      if(i != this.roleDimensions.length-1){
        this.$('#'+this.roles[i]).css({
          'width': this.roleDimensions[i+1] - this.roleDimensions[i],
          'left': this.roleDimensions[i]
        });

        this.$('span[rel='+this.roles[i]+']').css({
          'width': this.roleDimensions[i+1] - this.roleDimensions[i],
          'left': this.roleDimensions[i]
        });

        this.roleBackgroundWidths[i] = this.roleDimensions[i+1] - this.roleDimensions[i];
      }
      else{
        this.$('div[rel=last]').css({'left': this.roleDimensions[i]});
      }
      this.$('div[rel='+this.roles[i]+']').css({'left': this.roleDimensions[i]});
    }

    return this.$el;
  },

  destroy: function(){
    View.prototype.destroy.call(this);
  }
});