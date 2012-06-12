var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var Connections = require('models/connections/connections')
var ImportView = require('views/import_view');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home',
    'edit/:country/money/import': 'import'
  },

  home: function() {
    var actors = new Actors();

    // fetch all actors
    actors.fetch({
      success: function(){

        // fetch all connections
        var connections = new Connections();
        connections.fetch({
          success: function(){

            // instantiate the editor
            var editor = new ActorEditor({connections: connections, actors: actors});
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
