var DraggableView = require('./draggable_view');
var ActorDetailsView = require('./actor_details');

module.exports = DraggableView.extend({
  selectable: true,
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown' : 'dragStart',
      'dblclick'  : 'showDetails',
      'click'     : 'stopPropagation'
    }, parentEvents);
  },
  
  initialize: function(options){
    DraggableView.prototype.initialize.call(this, options);
    _.bindAll(this, 'destroy');

    this.width = options.editor.actorWidth;
    this.height = options.editor.actorHeight;

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('destroy', this.destroy, this);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  showDetails: function(){
    if(this.model.isLocked()) return; // don't show it if it's locked
    this.modal = new ActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
    this.options.editor.$el.append(this.modal.render().el);
  },

  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  determineName: function(){
    return this.model.get('abbreviation') || this.model.get('name') || '';
  },

  updateName: function(){
    this.$('.name').text( this.determineName() );
  },
  
  getRenderData: function() {
    return { name: this.determineName() };
  },

  afterRender: function(){
    this.updatePosition();

    this.$el.attr('id', this.model.id);
  },

  destroy: function(){
    // TODO: call the proper destroy method and clean up the editor's view instances
    // TODO: call lightbox destroy as well
    var self = this;
    this.$el.one(this.transEndEventName, function(){
      DraggableView.prototype.destroy.call(self);
    });
    this.$el.addClass('disappear');

    if(this.modal) this.modal.destroy()

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});