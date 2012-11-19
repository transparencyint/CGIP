var Country = require('./country');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Country,
  url: '/countries',
  
  comparator: function(country){
    return country.get('name');
  }
});