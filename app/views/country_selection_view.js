var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_selection'),
  
  className : 'countrySelection',

  events: {
    'keyup #add-country input': 'handleKeys'
  },

  initialize: function(){
    this.searchAndAddToList = _.debounce(this.searchAndAddToList, 100);
  },

  getRenderData: function(){
    return { countries: this.options.countries.toJSON(), user: user.toJSON() };
  },

  handleKeys: function(event){
    event.preventDefault();
    key = event.keyCode;

    if(key == 38 || key == 40){ // UP, DOWN
      var countryList = this.$('#add-country ul');
      var countryElements = this.$('#add-country ul li');
      var activeElement = countryList.find('.active');

      if(activeElement.length == 0){ // select the first element
        countryElements.first().addClass('active')
      }else{
        // move the active class up / down
        var activeIndex = activeElement.index();
        var nextIndex = key == 38 ? activeIndex-1 : activeIndex+1;
        countryElements.removeClass('active');
        nextIndex = nextIndex < 0 ? countryElements.length-1 : (nextIndex >= countryElements.length ? 0 : nextIndex)
        countryElements.eq(nextIndex).addClass('active');
      }
    }else if(key == 27){ // ESC
      // clear all the proposals
      this.$('#add-country ul li').remove();
      this.$('#add-country input').val('');
    }else if(key == 13){ // ENTER
      var currentSelectedCountry = this.$('#add-country ul li.active');
      if(currentSelectedCountry.length > 0){
        var country = currentSelectedCountry.data('country');
        console.log('add:', country);
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
    // find all fuzzy matching countries
    var countries = _.select(country_list, function(country){
      return (country.name.toLowerCase().indexOf(term.toLowerCase()) != -1);
    });

    var countryList = this.$('#add-country ul');
    var countrySelection = this;
    _.each(countries, function(country){
      var newLi = $('<li>').text(country.name).data('country', country);
      newLi.click(function(){
        console.log($(this).data('country'));
      });
      countryList.append(newLi);
    });
  }
});