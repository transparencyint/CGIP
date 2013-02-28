var View = require('./view');
var CountryView = require('./country_view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'box center',

  template: require('./templates/index'),

  events: function(){
    var _events = {
      'click a.map-edit-btn, a.map-cancel-btn' : 'toggleControlButtons'
    };

    return _events;
  },

  initialize: function(options){
    this.countries = this.options.countries;
    this.countryViews = {};

    this.countriesToDelete = [];

    _.bindAll(this, 'fadeInCountries', 'renderCountry', 'toggleControlButtons', 'addCountryToDelete');
  },

  toggleControlButtons: function(event){
    event.preventDefault();

    this.map.toggleClass('edit-mode');
    this.map.find('.point').removeClass('transparent');
    this.mapControls.find('a').toggleClass('hidden');
  },

  addCountryToDelete: function(country){
    if(this.countriesToDelete.indexOf(country) == -1)
      this.countriesToDelete.push(country);
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