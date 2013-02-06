var View = require('../view');
var ConnectionDetailsView = require('views/presentation/presentation_connection_details');
var ConnectionView = require('views/connection_view');

module.exports = ConnectionView.extend({

  template: require('../templates/presentation/presentation_connection'),

  tagName : 'div',
  className : 'connection',
  selectable : false,

  events: {
    'mouseover' : 'showMetadata',
    'mousemove' : 'stickMetadata',
    'mouseout' : 'hideMetadata',
    'mousedown' : 'hideMetadata',
    'click' : 'showDetails'
  },

  showDetails: function(){
    var cfw = new ConnectionDetailsView({ model: this.model, editor: this.editor, connection: this});
    this.editor.$el.append(cfw.render().el);
  }
  
});