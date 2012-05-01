var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home'
  },

  home: function() {
    var collection = new Actors();
    collection.fetch({
      success: function(){
        var editor = new ActorEditor({collection: collection});
        editor.render();
        $('body').append( editor.el );
      }
    });
  }
});