var View = require('./view');
var CountryView = require('./country_view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'box center',

  template: require('./templates/index'),

  events: function(){
    var _events = {
      'click .controls .edit, .controls .cancel' : 'toggleControlButtons',
      'click .controls .ok' : 'updateMapData',
      'click .controls .add' : 'addCountryToMap',

      'keyup #add-country input': 'handleKeys',
      'click #add-country button': 'toggleAddForm'
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

  addCountryToMap: function(event){
    event.preventDefault();

    // display an input field next to the add button
    this.$el.find('#add-country').toggleClass('hidden');
  },

  handleKeys: function(event){
    event.preventDefault();
    key = event.keyCode;

    if(key == 38 || key == 40){ // UP, DOWN
      var countryList = this.$('#add-country ul');
      var countryElements = this.$('#add-country ul li');
      var activeElement = countryList.find('.active');
      var input = this.$('#add-country input');

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
    }else if(key == 13){ // ENTER
      var currentSelectedCountry = this.$('#add-country ul li.active');
      if(currentSelectedCountry.length > 0){
        var country = currentSelectedCountry.data('country');
        this.addCountry(country);
      }
    }else if(key == 37 || key == 39){ // LEFT, RIGHT
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
    var results = this.$('#add-country ul')
    var input = this.$('#add-country input')
    var inputPos = input.offset();
    results.css({
      top: inputPos.top + input.height(),
      left: inputPos.left
    });
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
    var button = this.$('#add-country button');
    if(input.css('visibility') == 'visible'){
      this.clearSearch();
      input.css('visibility', 'hidden');
      button.text(t('Add Country'));
    }else{
      input.css('visibility', 'visible');
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
    
    // make the view ppear on the map
    countryView.$el.addClass('appear');

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