var AsyncRouter = require('./async_router');
var LoginView = require('views/login_view');
var CountrySelectionView = require('views/country_selection_view');
var CountryEditIndexView = require('views/country_edit_index_view');
var Actors = require('models/actors');
var ActorEditor = require('views/actor_editor');
var ActorConnection = require('views/connection_view');
var Connections = require('models/connections/connections');
var MoneyConnections = require('models/connections/money_connections');
var ConnectionsListView = require('views/connections_list_view');
var ImportView = require('views/csv_import/import_view');

module.exports = AsyncRouter.extend({
  routes: {
    '': 'index',
    '/': 'index',
    'login': 'login',
    'login?forward_to=:forward': 'login',
    'login/': 'login',
    'edit' : 'country_selection',
    'edit/' : 'country_selection',
    'edit/:country': 'country_edit_index',
    'edit/:country/': 'country_edit_index',
    'edit/:country/actors': 'actor_editor',
    'edit/:country/money/list': 'money_connections_list',
    'import/:country/money': 'import'
  },

  index: function(){
    this.navigate('/edit', { trigger: true });
  },

  login: function(forward){
    // redirect to edit in default case
    if(!forward) forward = '/edit';
    
    // parse the slashes
    forward = forward.split('__').join('/');
    
    this.switchToView(new LoginView({ router: this, forward: forward }));
  },

  country_selection: function(){
    this.switchToView(new CountrySelectionView({countries: this.app.countries}));
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
    // switch view with animation
    this.switchToView(new ImportView({country: country}));
  },

  money_connections_list: function(country){
    var router = this;

    var actors = new Actors();
    actors.country = country;

    var money_connections = new MoneyConnections();
    money_connections.country = country;

    // fetch all money connections and all actors
    $.when(money_connections.fetch(), actors.fetch()).done(function(){
      router.switchToView(new ConnectionsListView({collection: money_connections, actors: actors}));
    });
  }
});