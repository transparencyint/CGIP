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
      'mousedown'  : 'dragStart',
      'dblclick'          : 'showDetails',
      'click'             : 'stopPropagation'
    }, parentEvents);
  },
  
  initialize: function(options){
    DraggableView.prototype.initialize.call(this, options);

    this.width = 120;
    this.height = 40;    

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('destroy', this.destroy, this);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  showDetails: function(){
    this.modal = new ActorDetailsView({ model: this.model, actor: this });
    this.editor.$el.append(this.modal.render().el);
  },

  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  determineName: function(){
    return this.model.get('abbreviation') || this.model.get('name') || 'Unknown';
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
    DraggableView.prototype.destroy.call(this);

    if(this.modal) this.modal.destroy()

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});