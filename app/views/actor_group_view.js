// Actor groups are an easy way to group many actors which belong together.
// Actors can be added to a group via drag'n drop. 

var DraggableDroppableView = require('./draggable_droppable_view');
var ActorGroupActorView = require('./actor_group_actor_view');
var FakeActorView = require('./fake_actor_view');
var ActorView = require('./actor_view');
var ActorDetailsView = require('./actor_details');

module.exports = DraggableDroppableView.extend({
  dropClasses: [ActorView, ActorGroupActorView, FakeActorView],
  selectable: true,

  className: 'actor-group actor-holder empty',
  template : require('./templates/actor_group'),
  
  width: 144,
  height: 74,

  initialize: function(options){
    this.editor = options.editor;
    DraggableDroppableView.prototype.initialize.call(this, options);

    _.bindAll(this, 'actorAdded', 'drop', 'destroy', 'showDetails');

    this.model.on('change:actors', this.rePickActors, this);
    this.model.on('destroy', this.destroy, this);
    this.model.actors.on('add', this.addSubActorView, this);
    this.model.actors.on('remove', this.removeSubActorView, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('change:role', this.updateRole, this);
    this.model.on('change:hasCorruptionRisk', this.updateCorruptionRisk, this);
    this.model.on('change:organizationType', this.updateType, this);
  },

  events: function(){
    var _parentEvents = DraggableDroppableView.prototype.events();
    var _events = _.defaults({}, _parentEvents);

    // bind arrow
    _events[ this.inputDownEvent + ' .dropdown-control' ] = 'arrowClicked';
    
    return _events;
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
    this.updateRole();
    this.updateCorruptionRisk();
    this.$el.attr('id', this.model.id);
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
  
  determineName: ActorView.prototype.determineName,
  updateName: ActorView.prototype.updateName,
  updateType: ActorView.prototype.updateType,
  updateRole: ActorView.prototype.updateRole,
  updateCorruptionRisk: ActorView.prototype.updateCorruptionRisk,
  
  showDetails: function(event){
    if(this.model.isLocked()) return; // don't show it if it's locked
    if(!this.isDraggable) return;

    if(!this.wasOrIsDragging){
      this.modal = new ActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
      this.options.editor.$el.append(this.modal.render().el);
    }
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
      socket.emit('new_model', actor.toJSON());
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
        // try to add it to the group
        this.model.lock()
        
        this.model.tryAddToGroup({
          actor: view.model,
          connections: this.editor.connections,
          success: this.actorAdded
        });
      }
    }
  },
  
  actorAdded: function(){
    var model = this.model;
    model.save().done(function(){
      model.unlock();
    });
  },

  arrowClicked: function(event){
    if(this.hovered || this.isDragging) return;

    event.stopPropagation();
    
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