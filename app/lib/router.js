var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var ImportView = require('views/import_view');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home',
    'edit/:country/money/import': 'import'
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
  },

  import: function(country) {
    options = {country: country};
    var importView = new ImportView(options);
    importView.render();
    $('body').append( importView.el );
  }
});