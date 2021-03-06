var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/navigation'),
  
  className: 'navigation controls top left',
  
  currentRoute: '',
  currentLocation: '',
  locationTable: {
    'money_connections_list': 'Money List',
    'edit_countries': 'Country Selection'
  },

  initialize: function(options){
    options.router.on('all', this.update, this);
  },
  
  getRenderData: function(){
    var currentLocation = this.currentLocation;

    // find the country in the country list
    var currentCountry = _.find(country_list, function(country){
      return country['alpha-2'] === currentLocation;
    });
    var name = currentCountry ? currentCountry.name : '';

    if(this.locationTable[ this.currentRoute ])
      var type = t(this.locationTable[ this.currentRoute ]);

    return { 
      locationName: name,
      locationType: type,
      isoLocation: this.currentLocation,
      currentRoute: this.currentRoute
    };
  },
  
  update: function(action, country){
    // parse the route from the action
    var route = action.split('route:')[1];

    // return if it wasn't a 'route:' event
    if(!route) return;

    // remove the current location
    if(this.currentLocation) this.$el.removeClass( this.currentLocation );
    
    this.currentLocation = '';

    if(country){
      this.currentLocation = country;
      this.$el.addClass( this.currentLocation );  
    }
    
    this.currentRoute = route;

    this.render();
  }
  
});
