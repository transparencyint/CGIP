var View = require('./view');

module.exports = View.extend({

  className: 'roleBackgrounds',

  template: require('./templates/role_background'),

  events: {
    'mousedown .draghandle': 'dragRoleHandle'
  },
  
  initialize: function(options){
    this.country = options.country;

    this.roleAreaOffsets = {
      draghandleLeft: 0
    }

    this.roles = ['funding', 'coordination', 'implementation', 'monitoring'];
    
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
      $('.draghandle[rel=funding]').position().left,
      $('.draghandle[rel=coordination]').position().left,
      $('.draghandle[rel=implementation]').position().left,
      $('.draghandle[rel=monitoring]').position().left,
      $('.draghandle[rel=last]').position().left
    ];

    if(roleIndex == 0){
      $('#funding').css({'left': $('#funding').position().left - deltaXAbsolute, 'width': $('#funding').width() + deltaXAbsolute});
    }
    else if(roleIndex != -1){
        newWidth = this.roleDimensions[roleIndex] - this.roleDimensions[roleIndex-1];
        $('#'+this.roles[roleIndex-1]).css({'width': newWidth});

        newWidth = this.roleDimensions[roleIndex+1] - this.roleDimensions[roleIndex];
        $('#'+roleSelector).css({'left': this.roleDimensions[roleIndex], 'width': newWidth});     
    }
    else {
      newWidth = $('#monitoring').width();
      $('#monitoring').css({'width': newWidth -= deltaXAbsolute});
    }

    // move the dragHandle 
    $('.draghandle[rel='+roleSelector+']').css({'left': $('.draghandle[rel='+roleSelector+']').position().left - deltaXAbsolute});
  },

  dragRoleHandleStop: function(event){

    // set the new roleArea coordinates  
    this.country.set({'roleDimensions' : this.roleDimensions});
    this.country.save();

    $(document).unbind('mousemove.draghandle');
  },

  render: function(){
    var editor = this;

    this.$el.html( this.template() );
    this.roleHolder = this.$('.roleHolder');
    this.dragHandleBars = this.$('.dragHandleBars');

    this.roleDimensions = this.country.get('roleDimensions');

    for(var i=0; i<this.roleDimensions.length; i++){
      if(i != this.roleDimensions.length-1){
        this.$('#'+this.roles[i]).css({
          'width': this.roleDimensions[i+1] - this.roleDimensions[i],
          'left': this.roleDimensions[i]
        });
      }
      else{
        this.$('div[rel=last]').css({'left': this.roleDimensions[i]});
      }
      this.$('div[rel='+this.roles[i]+']').css({'left': this.roleDimensions[i]});
    }

    console.log(this.$el.context.innerHTML);
    return this.$el;
  },

  destroy: function(){
    View.prototype.destroy.call(this);
  }


});