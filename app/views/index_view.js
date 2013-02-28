var View = require('./view');
var CountryView = require('./country_view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'box center',

  template: require('./templates/index'),

  events: function(){
    var _events = {
      'click a.map-edit-btn, a.map-cancel-btn' : 'toggleControlButtons',
      'click a.map-ok-btn' : 'updateMapData'
    };

    return _events;
  },

  initialize: function(options){
    this.countries = this.options.countries;
    this.countryViews = {};

    this.countryViewsToDelete = {};

    _.bindAll(this, 'fadeInCountries', 'renderCountry', 'toggleControlButtons', 'addCountryToDelete', 'updateMapData');
  },

  toggleControlButtons: function(event){
    event.preventDefault();

    this.map.toggleClass('edit-mode');
    this.map.find('.point').removeClass('transparent');
    this.mapControls.find('a').toggleClass('hidden');

    _.each(this.countryViews, function(countryView){
      if(countryView.isDraggable)
        countryView.isDraggable = false;
      else
        countryView.isDraggable = true;
    });
  },

  addCountryToDelete: function(country, view){
      this.countryViewsToDelete[country] = view;
  },

  updateMapData: function(){
    var view = this;
    
    if(confirm(t('Are you Sure you want to proceed?'))){
      _.each(this.countryViewsToDelete, function(country){
        country.deleteCountry();
      });
    }
  },

  getRenderData: function() {
    return {
      countries: this.options.countries.toJSON()
    };
  },

  renderCountry: function(country){
    var countryView = new CountryView({ model : country, worldmap : this });
    countryView.render();

    this.map.append(countryView.el);
    this.countryViews[country.id] = countryView;
  },
  
  render: function(){
    this.$el.html( this.template( this.getRenderData() ) );
    this.map = this.$('.map');
    this.mapControls = this.$('.map-controls');

    this.countries.each(this.renderCountry);

    this.afterRender();
  },

  afterRender: function(){
    _.defer(this.fadeInCountries);
  },
  
  fadeInCountries: function(){
    var countries = this.$('.point');
    var count = countries.size();
    
    countries.each(function(i, country){      
      setTimeout(
        function(){ 
          $(country).addClass('appear');
        }, 
        Math.sqrt(++i/count) * 1000
      );
    });
  }

});