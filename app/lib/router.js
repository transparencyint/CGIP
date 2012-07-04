var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var Connections = require('models/connections/connections')
var ImportView = require('views/import_view');

module.exports = Backbone.Router.extend({
  routes: {
    ':country/actors/edit': 'actor_editor',
    ':country/money/import': 'import'
  },

  actor_editor: function(country) {
    var actors = new Actors();
    actors.country = country;

    // fetch all actors
    actors.fetch({
      success: function(){

        // fetch all connections
        var connections = new Connections();
        connections.country = country;
        connections.fetch({
          success: function(){

            // instantiate the editor
            var editor = new ActorEditor({connections: connections, actors: actors, country: country});
            editor.render();
            $('#container').empty().html( editor.el );    
          }
        });
        
      }
    });
  },

  import: function(country) {
    var options = {country: country};
    var importView = new ImportView(options);
    importView.render();
    $('#container').empty().html( importView.el );
  }
});
