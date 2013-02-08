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
    
    _.bindAll(this, 'showDetails');

    this.model.coinSizeFactor = 1;
    this.edgeRadius = 10;
    this.strokeWidth = 6;
    this.markerRatio = 2.5;
    this.markerSize = 4;
    this.longPressDelay = 500;
    
    this.selectionBorderSize = 4;
    this.clickAreaRadius = 40;

    this.editor = options.editor;

    this.corruptionRisk = this.model.get('hasCorruptionRisk');
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

    this.isMoney = this.model.get('connectionType') === 'money';
  },

  events: function(){
    var _events = {
      'click': 'select',
      'dblclick': 'showDetails'
    };
    
    _events[ this.inputMoveEvent ] = 'updateMetada';

    return _events;
  },

  updateMetada: ConnectionView.prototype.updateMetada,
  select: View.prototype.select,
  longPress: ConnectionView.prototype.longPress,
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