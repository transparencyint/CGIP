var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/navigation'),
  
  className: 'navigation controls top left',
  
  _currentLocation: '',
  _countryTable: {
    'pe': 'Peru',
    'do': 'Dom. Republic',
    'mx': 'Mexico',
    'bd': 'Bangladesh',
    'ke': 'Kenya',
    'md': 'Maldives'
  },

  initialize: function(options){
    options.router.on('all', this.update, this);
  },
  
  getRenderData: function(){
    return { 
      locationName: this._countryTable[ this._currentLocation ] 
    };
  },
  
  update: function(location, country){
    if(this._currentLocation) this.$el.removeClass( this._currentLocation );
    this._currentLocation = country;
    this.$el.addClass( this._currentLocation );
    this.render();
  }
  
});
