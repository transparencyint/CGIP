// Each actor is visualized as a box, which holds the Name/Abbreviation, the actor Type and the role.
// The surrounding border indicates the assigned role. An actor can be positioned via drag and drop
// and can be selected, which is visualized as such with a coloured border around. 
// Additionally, a possible corruption risk will be displayed with an exclamation mark. 
// Double clicking the actor opens the actor details window. 


var DraggableDroppableView = require('./draggable_droppable_view');
var ActorDetailsView = require('./actor_details');
var FakeActorView = require('./fake_actor_view');

module.exports = DraggableDroppableView.extend({
  selectable: true,
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: function(){
    var _parentEvents = DraggableDroppableView.prototype.events();
    // clone parent events
    var _events = _.defaults({}, _parentEvents);
  
    return _events;
  },
  
  initialize: function(options){
    DraggableDroppableView.prototype.initialize.call(this, options);
    _.bindAll(this, 'newGroupReady', 'destroy', 'showDetails','select');

    this.width = options.editor.actorWidth;
    this.height = options.editor.actorHeight;

    this.dropClasses = [require('./actor_view'), FakeActorView];
    
    this.on('dragging', this.cancelLongPress, this);
    
    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('change:role', this.updateRole, this);
    this.model.on('destroy', this.destroy, this);
    this.model.on('change:hasCorruptionRisk', this.updateCorruptionRisk, this);
    this.model.on('change:organizationType', this.updateType, this);
    this.initOrganizationType();
  },

  initOrganizationType: ActorDetailsView.prototype.initOrganizationType,

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  showDetails: function(event){
    if(this.model.isLocked()) return; // don't show it if it's locked
    
    this.modal = new ActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
    this.options.editor.$el.append(this.modal.render().el);
  },
  
  determineName: function(){
    return this.model.get('abbreviation') || this.model.get('name') || '';
  },

  updateName: function(){
    this.$('.name').text( this.determineName() );
  },
  
  updateRole: function(){
    var role = this.model.get('role');
    if(_.isArray(role) && role.length > 1)
      role = role.join(" and ");
    else if(_.isArray(role) && role.length == 1)
      role = role[0]

    this.$el.attr('data-role', role);
  },
  
  updateType: function(){
    this.$('.type').text( this.model.get('organizationType') );
  },

  updateCorruptionRisk: function(){
    this.$el.toggleClass('hasCorruptionRisk', this.model.get('hasCorruptionRisk'));
  },
  
  drop: function(event, view){
    // stop the actor dragging
    if(view instanceof FakeActorView){
      return view.reset();
    }else{
      view.isDragging = false;
      this.model.turnIntoGroup({
        firstActor: view.model, 
        connections: this.editor.connections,
        success: this.newGroupReady
      });
    }
  },
  
  newGroupReady: function(newGroup){
    this.editor.actorGroups.add(newGroup);
  },

  getRenderData: function() {
    return { 
      name: this.determineName(), 
      orgaType: this.orgaType,
      organizationType: this.model.get('organizationType'),
      typeOther: this.model.get('typeOther'),
      hasCorruptionRisk: this.model.get('hasCorruptionRisk')
    };
  },

  afterRender: function(){
    this.updatePosition();
    this.updateRole();

    this.$el.attr('id', this.model.id);
    
    this.updateCorruptionRisk();
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