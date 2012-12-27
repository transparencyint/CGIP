var DraggableView = require('./draggable_view');
var ActorGroupActor = require('./actor_group_actor');

module.exports = DraggableView.extend({
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
      'mousedown'         : 'dragStart',
      'mousedown .caption': 'select',
      'click'             : 'showActors'
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

    // render the subactors
    var actorViews = [];
    var newView = null;
    var container = this.$('.actors');
    var editor = this.editor;
    this.model.actors.each(function(actor){
      newView = new ActorGroupActor({model: actor, editor: editor});
      container.append(newView.render().el);
      actorViews.push(newView);
    });
    this.actorViews = actorViews;

    return this;
  },

  afterRender: function(){
    this.updatePosition();
  },

  addSubActorView: function(){
    debugger
  },

  removeSubActorView: function(actor){
    debugger
  },

  overlapsWith: function(view){
    var myPos = this.$el.offset();
    var viewPos = view.$el.offset();
    var myWidth = this.$el.outerWidth();
    var myHeight = this.$el.outerHeight();

    // check if have an intersection
    var overlaps =   (viewPos.left < myPos.left + myWidth)
                  && (viewPos.left + view.width > myPos.left)
                  && (viewPos.top < myPos.top + myHeight)
                  && (viewPos.top + view.height > myPos.top);
    return overlaps;
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
    // return if it's this view
    if(view === this) return;

    if(this.overlapsWith(view)){
      // remove it from the current collection
      this.editor.actors.remove(view.model);
      // and add it to the group
      this.model.addToGroup(view.model);
      this.model.save();
    }

    if(this.hovered)
      this.dragOut();      
  },

  showActors: function(event){
    if(this.hovered) return;

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