var Collection = require('models/collection');
var MoneyConnection = require('./money_connection');

module.exports = Collection.extend({
  model: MoneyConnection,
  url: '/connections',
  db: {
    view: 'connectionsByType',
    key: 'money'
  },

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  }
});