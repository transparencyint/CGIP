var CountrySelectionView = require('views/country_selection_view');
var CountryEditIndexView = require('views/country_edit_index_view');
var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var Connections = require('models/connections/connections')
var ImportView = require('views/import_view');

module.exports = Backbone.Router.extend({
  routes: {
    'edit' : 'country_selection',
    'edit/' : 'country_selection',
    'edit/:country': 'country_edit_index',
    'edit/:country/': 'country_edit_index',
    'edit/:country/actors': 'actor_editor',
    'import/:country/money': 'import'
  },

  country_selection: function(){
    var countrySelectionView = new CountrySelectionView()
    $('#container').html(countrySelectionView.render().el);
  },

  country_edit_index: function(country){
    var countryEditIndexView = new CountryEditIndexView({ country: country});
    $('#container').html(countryEditIndexView.render().el);
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
