var DraggableDroppableView = require('./draggable_droppable_view');

module.exports = DraggableDroppableView.extend({

  template : require('./templates/country'),
  
  className : 'point',

  events: function(){
    var _parentEvents = DraggableDroppableView.prototype.events();
    // clone parent events
    var _events = _.defaults({}, _parentEvents);
  
    return _events;
  },
  
  initialize: function(options){
    //DraggableDroppableView.prototype.initialize.call(this, options);

    this.model = options.model;

    _.bindAll(this, 'destroy');

    this.model.on('change:pos', this.updatePosition, this);
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

  updatePosition: function(){
    var view = this;
    var currentCountry;

    //if(!this.model.get('pos')){

      currentCountry = _.find(country_list, function(country){
        if(country['alpha-2'] === view.model.get('abbreviation'))
          return country;
      });

      //view.model.set({ pos: currentCountry.pos });
      //console.log(view.model);
      //view.model.save();
    //}
    //var pos = this.model.get('pos');
    console.log(currentCountry)
    var pos = currentCountry.pos;
    this.$el.css({'top': pos.y, 'left': pos.x});
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },
  
  drop: function(event, view){
    // stop the actor dragging
    if(view instanceof FakeActorView){
      return view.reset();
    }else{
      view.isDragging = false;
      var newGroup = this.model.turnIntoGroup(view.model);
      this.editor.actorGroups.add(newGroup);
    }
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
    this.$el.addClass('disappear');

    if(this.modal) this.modal.destroy()

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});