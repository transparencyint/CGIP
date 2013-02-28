var DraggableDroppableView = require('./draggable_droppable_view');

module.exports = DraggableDroppableView.extend({

  template : require('./templates/country'),
  
  className : 'point',

  events: function(){
    var _parentEvents = DraggableDroppableView.prototype.events();
    // clone parent events
    var _events = _.defaults({}, _parentEvents);
    
    _events['click a.delete-btn'] = 'addCountryToDelete';
    _events['click a'] = 'performClick';

    return _events;
  },
  
  initialize: function(options){
    //DraggableDroppableView.prototype.initialize.call(this, options);

    this.model = options.model;
    this.worldmap = options.worldmap;
    this.isDraggable = false;

    _.bindAll(this, 'destroy', 'drag', 'dragStop', 'deleteCountry');

    this.model.on('change:pos', this.updatePosition, this);
  },

  addCountryToDelete: function(event){
    event.preventDefault();

    var currentEl = $(event.target).parents('.point');
    var country = currentEl.attr('id');

    currentEl.addClass('transparent');

    // add country to delete list
    this.worldmap.addCountryToDelete(country, this);
  },

  deleteCountry: function(){
    this.model.destroy();  
    this.destroy();
  }, 

  getRenderData: function() {
      return this.model.toJSON();
  },

  render: function() {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();

    // check if the model is locked, if so, toggle the view's lock
    if(this.model && this.model.lockable && this.model.isLocked()){
      this.toggleLocked();
    }

    return this;
  },

  showDetails: function(){},

  performClick: function(event){
    if($(event.target).hasClass('noclick'))
      event.preventDefault();
  },

  updatePosition: function(){
    var view = this;
    var currentCountry;

    if(!this.model.get('pos')){

      currentCountry = _.find(country_list, function(country){
        if(country['alpha-2'] === view.model.get('abbreviation'))
          return country;
      });

      view.model.set({ pos: currentCountry.pos });
      //console.log(view.model);
      view.model.save();
    }
    var pos = this.model.get('pos');
    //console.log(currentCountry)
    //var pos = currentCountry.pos;
    this.$el.css({'top': pos.y, 'left': pos.x});
  }, 

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  drag: function(event){ 

    // dont enable dragging if user isn't logged in
    if(!window.user.isLoggedIn()){
      return;
    }

    this.$el.find('a').addClass('noclick');

    event.preventDefault();
    event.stopPropagation();

    var pos = this.model.get('pos');
    
    var dx = (this.normalizedX(event) - pos.x - this.startX);
    var dy = (this.normalizedY(event) - pos.y - this.startY);
    
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

  dragStop: function(){
    if(this.model && this.model.lockable)
      this.model.unlock();

    if(this.wasOrIsDragging){
      // emit a global dragstop event
      $(document).trigger('viewdragstop', this);

      this.wasOrIsDragging = false;
    }
      
    $(document).off(this.inputMoveEvent, this.drag);

    // save new positions
    this.model.save();

    // set the new country positions
    var view = this;
    _.defer(function(){
      view.$el.find('a').removeClass('noclick');
    });
  },

  afterRender: function(){
    this.updatePosition();

    this.$el.attr('id', this.model.get('abbreviation'));
  },

  destroy: function(){
    var self = this;
    this.$el.one(this.transEndEventName, function(){
      DraggableDroppableView.prototype.destroy.call(self);
    });
    this.$el.removeClass('transparent').addClass('disappear');
  }
});