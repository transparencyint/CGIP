var View = require('./view');
var ActorEditor = require('./actor_editor');

module.exports = View.extend({

  initialize: function(){
    this.initializeProperties();
  },

  initializeProperties: ActorEditor.prototype.initializeProperties

});