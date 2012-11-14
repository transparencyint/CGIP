var Country = require('./country');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Country,
  url: '/countries',
  
  // finds a country by its iso name
  byIsoName: function(iso){
    return this.find(function(country){
      return country.get('abbreviation') == country;
    });
  }
});