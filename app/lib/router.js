var AsyncRouter = require('./async_router');
var IndexView = require('views/index_view');
var CountryMapView = require('views/presentation/country_map_view');
var LoginView = require('views/login_view');
var CountrySelectionView = require('views/country_selection_view');
var EditCountriesView = require('views/edit_countries_view');
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
    'show/:country': 'showCountry',
    'show/:country/': 'showCountry',
    'login': 'login',
    'login?forward_to=:forward': 'login',
    'login/': 'login',
    'edit' : 'country_selection',
    'edit/' : 'country_selection',
    'edit/countries': 'edit_countries',
    'edit/countries/': 'edit_countries',
    'edit/:country': 'actor_editor',
    'edit/:country/': 'actor_editor',
    'edit/:country/actors': 'actor_editor',
    'edit/:country/money/list': 'money_connections_list',
    'import/:country/money': 'import'
  },

  index: function(){
    config.disableRealtime();

    this.switchToView(new IndexView({countries: this.app.countries}));
  },

  showCountry: function(country){
    config.disableRealtime();

    var router = this;
    var countries = this.app.countries;
    var selectedCountry;
    var actors = new Actors();
    actors.country = country;

    selectedCountry = countries.find(function(country){
      return country.get('abbreviation') == actors.country;
    });

    var connections = new Connections();
    connections.country = country;

    // fetch all actors and all connections
    $.when(actors.fetch(), connections.fetch()).done(function(){
      // instantiate the editor
      router.switchToView(new CountryMapView({connections: connections, actors: actors, country: selectedCountry}));
    });
  },

  login: function(forward){
    config.disableRealtime();

    // redirect to edit in default case
    if(!forward) forward = '/edit';
    
    // parse the slashes
    forward = forward.split('__').join('/');
    
    this.switchToView(new LoginView({ router: this, forward: forward }));
  },

  country_selection: function(){
    config.disableRealtime();
    this.switchToView(new CountrySelectionView({countries: this.app.countries}));
  },

  edit_countries: function(){
    config.disableRealtime();
    this.switchToView(new EditCountriesView({countries: this.app.countries}));
  },

  actor_editor: function(country) {
    config.enableRealtime();
    var router = this;
    var countries = this.app.countries;
    var selectedCountry;
    var actors = new Actors();
    actors.country = country;
    
    selectedCountry = countries.find(function(country){
      return country.get('abbreviation') == actors.country;
    });

    var connections = new Connections();
    connections.country = country;

    // fetch all actors and all connections
    $.when(actors.fetch(), connections.fetch()).done(function(){
      // instantiate the editor
      router.switchToView(new ActorEditor({connections: connections, actors: actors, country: selectedCountry}));
    });
  },

  import: function(country) {
    config.disableRealtime();
    // switch view with animation
    this.switchToView(new ImportView({country: country}));
  },

  money_connections_list: function(country){
    config.disableRealtime();
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