var View = require('./view');
var CountryView = require('./country_view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'box center',

  template: require('./templates/index'),

  events: function(){
    var _events = {
      'click .map-controls .edit, .map-controls .cancel' : 'toggleControlButtons',
      'click .map-controls .ok' : 'updateMapData',

      'keyup #add-country input': 'handleKeys',
      'click #add-country .button': 'toggleAddForm',
      'submit form': 'handleSubmit'
    };

    return _events;
  },

  initialize: function(options){
    this.countries = this.options.countries;
    this.countryViews = {};

    this.countryViewsToDelete = {};

    _.bindAll(this, 'fadeInCountries', 'renderCountry', 'addCountryToDelete');
  },

  toggleControlButtons: function(event){
    event.preventDefault();

    this.map.toggleClass('edit-mode');
    this.mapControls.toggleClass('edit-mode');
    this.map.find('.point').removeClass('transparent');

    _.each(this.countryViews, function(countryView){
      if(countryView.isDraggable)
        countryView.isDraggable = false;
      else
        countryView.isDraggable = true;
    });
  },
  
  handleSubmit: function(event){
    event.preventDefault();
    
    var currentSelectedCountry = this.$('#add-country ul li.active');
    if(currentSelectedCountry.length > 0){
      var country = currentSelectedCountry.data('country');
      this.addCountry(country);
    }
  },

  handleKeys: function(event){
    event.preventDefault();
    key = event.keyCode;

    if(key == 38 || key == 40){ // UP, DOWN
      var countryList = this.$('#add-country ul');
      var countryElements = countryList.find('li');
      var activeElement = countryList.find('.active');
      var input = countryList.find('input');

      if(activeElement.length == 0){ // select the first element
        countryElements.first().addClass('active');
        input.val(countryList.first().text())
      }else{
        // move the active class up / down
        var activeIndex = activeElement.index();
        var nextIndex = key == 38 ? activeIndex-1 : activeIndex+1;
        countryElements.removeClass('active');
        // -1 -> end of list; list+1 -> 0
        nextIndex = nextIndex < 0 ? countryElements.length-1 : (nextIndex >= countryElements.length ? 0 : nextIndex)
        countryElements.eq(nextIndex).addClass('active');
        input.val(countryElements.eq(nextIndex).text())
      }
    }else if(key == 27){ // ESC
      // clear all the proposals
      this.clearSearch();
    }
    else if(key == 37 || key == 39 || key == 13){ // LEFT, RIGHT, ENTER
      // DO NOTHING ;)
    }else{
      this.$('#add-country ul li').remove();
      var term = this.$('#add-country input').val()
      if(term.length > 1)
        this.searchAndAddToList(term);
    }
  },

  searchAndAddToList: function(term){
    if(!this.positioned) this.position()
    // find all fuzzy matching countries
    var countries = _.select(country_list, function(country){
      return (country.name.toLowerCase().indexOf(term.toLowerCase()) != -1);
    });

    var countryList = this.$('#add-country ul');
    var countrySelection = this;
    _.each(countries, function(country){
      var newLi = $('<li>').css('background-image', 'url(/images/flags/' + country['alpha-2'] + '.svg)').text(country.name).data('country', country);
      newLi.click(function(){
        countrySelection.addCountry($(this).data('country'));
      });
      countryList.append(newLi);
    });
  },

  position: function(){
    this.positioned = true;
    var input = this.$('#add-country input');
    var maxHeight = this.$el.height() - input.offset().top - input.outerHeight() - 21;
    this.$('#add-country ul').css('max-height', maxHeight);
  },

  addCountry: function(country){
    this.clearSearch();
    if(!this.options.countries.containsCountry(country['alpha-2'])){
      var countryModel = new this.options.countries.model({
        abbreviation: country['alpha-2'],
        name: country.name,
        type: 'country'
      });
      var countries = this.options.countries;
      countries.add(countryModel);

      this.renderCountry(countryModel);
    }
  },

  clearSearch: function(){
    this.$('#add-country ul li').remove();
    this.$('#add-country input').val('');
  },

  toggleAddForm: function(){
    var input = this.$('#add-country input');
    var button = this.$('#add-country .button');
    
    if(this.mapControls.hasClass('mode-add-country')){
      this.clearSearch();
      this.mapControls.removeClass('mode-add-country');
      button.text(t('Add Country'));
    } else {
      this.mapControls.addClass('mode-add-country');
      input.focus();
      button.text(t('Close'));
    }
  },

  addCountryToDelete: function(country, view){
    this.countryViewsToDelete[country] = view;
  },

  removeCountryToDelete: function(country, view){
    delete this.countryViewsToDelete[country];
  },

  updateMapData: function(event){
    var view = this;
    
    if(!_.isEmpty(this.countryViewsToDelete)){
      if(confirm(t('Are you Sure you want to proceed?'))){
        _.each(this.countryViewsToDelete, function(country){
          country.deleteCountry();
        });
      }
    }
    
    this.toggleControlButtons(event);
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
    
    document.redraw();
    
    // make the view appear on the map
    countryView.$el.addClass('appear');

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