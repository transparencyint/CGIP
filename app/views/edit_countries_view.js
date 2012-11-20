var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/edit_countries'),
  
  className: 'edit-countries',

  events: {
    'keyup #add-country input': 'handleKeys',
    'click #add-country button': 'toggleAddForm',
    'click .delete': 'deleteCountry'
  },

  initialize: function(){
    this.searchAndAddToList = _.debounce(this.searchAndAddToList, 100);
    this.options.countries.on('add', this.render, this);
    this.options.countries.on('remove', this.render, this);
  },

  getRenderData: function(){
    return { countries: this.options.countries.toJSON(), user: user.toJSON() };
  },

  deleteCountry: function(event){
    var countryId = $(event.currentTarget).data('country-id');
    var country = this.options.countries.get(countryId);
    country.destroy();
    console.log(countryId, country.toJSON())
    //this.options.first()
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
      var newLi = $('<li>').text(country.name).data('country', country);
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
    console.log(inputPos)
    results.css({
      top: inputPos.top + input.height(),
      left: inputPos.left
    });
  },

  addCountry: function(country){
    this.clearSearch();
    if(!this.options.countries.containsCountry(country['alpha-2']))
      this.options.countries.create({
        abbreviation: country['alpha-2'],
        name: country.name,
        type: 'country'
      });
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
      button.text('Add Country');
    }else{
      input.css('visibility', 'visible');
      input.focus();
      button.text('Close');
    }
  }
});