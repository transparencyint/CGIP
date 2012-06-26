var Collection = require('models/collection');
var MoneyConnection = require('./money_connection');

module.exports = Collection.extend({
  model: MoneyConnection,

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  }
});