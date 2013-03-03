// This view is the equivalents of the connection view. It leaks all the editing features of the connection

var View = require('../view');
var ConnectionDetailsView = require('views/presentation/presentation_connection_details');
var ConnectionView = require('views/connection_view');

module.exports = ConnectionView.extend({

  template: require('../templates/presentation/presentation_connection'),

  tagName : 'div',
  className : 'connection',
  selectable : true,

  initialize: function(options){
    View.prototype.initialize.call(this, options);
    
    _.bindAll(this, 'showDetails', 'select');

    this.initializeProperties(options);

    this.model.on('change:hasCorruptionRisk', this.updateCorruptionRisk, this);

    if(options.noClick)
      this.$el.unbind('click');

    if(this.model.from){
      this.model.from.on('change:pos', this.update, this);
    }
      
    if(this.model.to){
      this.model.to.on('change:pos', this.update, this);
    }

    this.model.on('inScope', this.inScope, this);
  },

  initializeProperties: ConnectionView.prototype.initializeProperties,

  events: function(){
    var _events = {
      'click': 'select',
      'dblclick': 'showDetails'
    };
    
    _events[ this.inputMoveEvent ] = 'updateMetada';
    _events[ this.inputDownEvent ] = 'inputDown';
    _events[ this.inputUpEvent ] = 'cancelLongPress';

    return _events;
  },

  updateMetada: ConnectionView.prototype.updateMetada,
  select: View.prototype.select,
  inputDown: ConnectionView.prototype.inputDown,
  inScope: ConnectionView.prototype.inScope,

  showDetails: function(){
    
    var mousePosition = {
      left: this.normalizedX(event),
      top: this.normalizedY(event)
    };

    var cfw = new ConnectionDetailsView({ model: this.model, editor: this.editor, connection: this, mousePosition: mousePosition});
    this.editor.$el.append(cfw.render().el);
  }
  
});