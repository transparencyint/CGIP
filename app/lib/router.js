var application = require('application');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home'
  },

  home: function() {
    var editor = new ActorEditor();
    editor.render();
    $('body').append( editor.el );
  }
});
