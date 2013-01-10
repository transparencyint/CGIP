var DraggableView = require('./draggable_view');
var ActorGroupActorView = require('./actor_group_actor_view');

module.exports = DraggableView.extend({
  selectable: true,

  className: 'actor-group',
  template : require('./templates/actor_group'),

  initialize: function(){
    DraggableView.prototype.initialize.call(this);

    _.bindAll(this, 'checkHover', 'checkDrop');

    // the current hover state
    this.hovered = false;
    this.$document = $(document);

    this.$document.on('viewdrag', this.checkHover);
    this.$document.on('viewdragstop', this.checkDrop);

    this.model.actors.on('add', this.addSubActorView, this);
    this.model.actors.on('remove', this.removeSubActorView, this);
  },

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown'               : 'dragStart',
      'click .dropdown-control' : 'showActors'
    }, parentEvents);
  },

  getRenderData: function(){
    var data = DraggableView.prototype.getRenderData.call(this);
    data.actors = this.model.actors.toJSON();
    return data;
  },

  render: function(){
    // call the super function
    DraggableView.prototype.render.call(this);

    _.bindAll(this, 'addSubActorView');

    // render the subactors
    this.actorViews = {};

    this.model.actors.each(this.addSubActorView);

    return this;
  },

  afterRender: function(){
    this.updatePosition();
  },

  addSubActorView: function(actor){
    var newView = new ActorGroupActorView({model: actor, editor: this.editor});
    this.$('.actors').append(newView.render().el);
    this.actorViews[actor.id] = newView;
  },

  removeSubActorView: function(actor){
    this.actorViews[actor.id].destroy();
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  checkHover: function(event, view){
    // return if it's this view
    if(view === this) return

    if(view.$el.hasClass('actor')){
      // if it overlaps, give feedback
      if(this.overlapsWith(view))
        this.dragHover(view);
      else
        if(this.hovered){
          this.dragOut();
        }
    }
  },

  dragHover: function(view){
    this.hovered = true;
    this.hoveredView = view;
    this.hoveredView.$el.css('opacity', .5);
    this.$el.addClass('show-actors');
  },

  dragOut: function(){
    this.hovered = false;
    this.$el.removeClass('show-actors');
    if(this.hoveredView){
      this.hoveredView.$el.css('opacity', 1);
      this.hoveredView = null;  
    }
  },

  checkDrop: function(event, view){
    if(event.isPropagationStopped()) return;

    // return if it's this view
    if(view === this) return;

    if(this.overlapsWith(view)){
      // add it to the group
      this.model.addToGroup(view.model);
      this.model.save();
    }

    if(this.hovered)
      this.dragOut();      
  },

  showActors: function(event){
    if(this.hovered || this.isDragging) return;

    this.$el.toggleClass('show-actors');
  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);

    // destroy all sub actors
    _.each(this.actorViews, function(actorView){ actorView.destroy(); });

    this.$document.off('viewdrag', this.checkHover);
    this.$document.off('viewdragstop', this.checkDrop);
  }
});