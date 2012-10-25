var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/navigation'),
  
  className: 'navigation controls top left',
  
  currentRoute: '',
  currentLocation: '',
  countryTable: {
    'pe': 'Peru',
    'do': 'Dom. Republic',
    'mx': 'Mexico',
    'bd': 'Bangladesh',
    'ke': 'Kenya',
    'mv': 'Maldives'
  },
  locationTable: {
    'money_connections_list': 'Money List'
  },

  initialize: function(options){
    options.router.on('all', this.update, this);
  },
  
  getRenderData: function(){
    return { 
      locationName: this.countryTable[ this.currentLocation ],
      locationType: this.locationTable[ this.currentRoute ],
      isoLocation: this.currentLocation
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
