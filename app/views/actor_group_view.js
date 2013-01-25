var DraggableDroppableView = require('./draggable_droppable_view');
var ActorGroupActorView = require('./actor_group_actor_view');
var FakeActorView = require('./fake_actor_view');
var ActorView = require('./actor_view');

module.exports = DraggableDroppableView.extend({
  dropClasses: [ActorView, ActorGroupActorView, FakeActorView],
  selectable: true,

  className: 'actor-group empty',
  template : require('./templates/actor_group'),

  initialize: function(options){
    DraggableDroppableView.prototype.initialize.call(this, options);

    _.bindAll(this, 'drop');

    this.editor = options.editor;

    this.model.on('change:actors', this.rePickActors, this);
    this.model.actors.on('add', this.addSubActorView, this);
    this.model.actors.on('remove', this.removeSubActorView, this);
  },

  events: function(){
    var parentEvents = DraggableDroppableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown'               : 'dragStart',
      'click .dropdown-control' : 'showActors'
    }, parentEvents);
  },

  getRenderData: function(){
    var data = DraggableDroppableView.prototype.getRenderData.call(this);
    data.actors = this.model.actors.toJSON();
    return data;
  },

  render: function(){
    // call the super function
    DraggableDroppableView.prototype.render.call(this);

    _.bindAll(this, 'addSubActorView');

    // render the subactors
    this.actorViews = {};

    this.model.actors.each(this.addSubActorView);

    return this;
  },

  afterRender: function(){
    this.updatePosition();
  },
  
  rePickActors: function(){
    // manually remove the missing actors from the collection
    var actors = this.model.actors;
    var remainingActors = [];
    _.each(this.model.get('actors'), function(id){
      if(actors.get(id)) remainingActors.push(actors.get(id));
    });
    actors.reset(remainingActors, {silent: true});

    // pick out new actors from the editor
    this.model.pickOutActors(this.editor.actors);

    // rerender
    this.render();
  },

  open: function(){
    this.$el.addClass('open');
  },
  
  close: function(){
    this.$el.removeClass('open');
  },
  
  toggle: function(){
    this.$el.toggleClass('open');
  },

  addSubActorView: function(actor){
    var newView = new ActorGroupActorView({model: actor, editor: this.editor});
    this.$('.actors').append(newView.render().el);
    this.actorViews[actor.id] = newView;
    
    this.$el.removeClass('empty');
  },

  removeSubActorView: function(actor){
    if(this.actorViews[actor.id])
      this.actorViews[actor.id].destroy();
    
    // remove destroyed actor from object
    delete this.actorViews[actor.id];
    
    // don't show the arrow when it's empty
    // idealy: if there is only one view left,
    // transform into actor view
    if(_.isEmpty(this.actorViews))
      this.isEmpty();
  },
  
  isEmpty: function(){
    this.$el.addClass('empty');
    // turn this group into a normal actor
    var actor = this.model.turnIntoNormalActor();
    var editor = this.editor;
    actor.save().done(function(){
      editor.addActorWithoutPopup(actor);
    });
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  dragHover: function(view){
    this.open();
  },

  dragOut: function(){
    this.close();
  },

  drop: function(event, view){
    // Reset FakeActorViews
    if(view instanceof FakeActorView){
      return view.reset();
    }else{
      // is it already in the list?
      if(this.model.actors.contains(view.model)){
        // stop propagation and do nothing
        event.stopPropagation();
        return;
      }else{
        // add it to the group
        var model = this.model;
        model.lock()
        this.model.addToGroup(view.model);
        this.model.save({
          success: function(){
            model.unlock();
          }
        });
      }
    }
  },

  showActors: function(event){
    if(this.hovered || this.isDragging) return;
    this.toggle();
  },

  destroy: function(){
    DraggableDroppableView.prototype.destroy.call(this);

    // destroy all sub actors
    _.each(this.actorViews, function(actorView){ actorView.destroy(); });

    this.model.actors.off('add', this.addSubActorView);
    this.model.actors.off('remove', this.removeSubActorView);
  }
});