var application = require('application');
var ActorEditor = require('views/actor_editor');

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
