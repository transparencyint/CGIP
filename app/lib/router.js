var AsyncRouter = require('./async_router');
var CountrySelectionView = require('views/country_selection_view');
var CountryEditIndexView = require('views/country_edit_index_view');
var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var Connections = require('models/connections/connections')
var ImportView = require('views/import_view');

module.exports = AsyncRouter.extend({
  routes: {
    'edit' : 'country_selection',
    'edit/' : 'country_selection',
    'edit/:country': 'country_edit_index',
    'edit/:country/': 'country_edit_index',
    'edit/:country/actors': 'actor_editor',
    'import/:country/money': 'import'
  },

  country_selection: function(){
    this.switchToView(new CountrySelectionView());
  },

  country_edit_index: function(country){
    this.switchToView(new CountryEditIndexView({ country: country}));
  },

  actor_editor: function(country) {
    var router = this;
    var actors = new Actors();
    actors.country = country;

    var connections = new Connections();
    connections.country = country;

    // fetch all actors and all connections
    $.when(actors.fetch(), connections.fetch()).done(function(){
      // instantiate the editor
      router.switchToView(new ActorEditor({connections: connections, actors: actors, country: country}));
    });
  },

  import: function(country) {
    var options = {country: country};
    var importView = new ImportView(options);
    importView.render();
    $('#container').empty().html( importView.el );
  }
});
