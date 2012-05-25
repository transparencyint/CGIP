var Collection = require('models/collection');
var AccountabilityConnection = require('./accountability_connection');

module.exports = Collection.extend({
  model: AccountabilityConnection,
  url: '/connections',
  db: {
    view: 'connectionsByType',
    keys: ['accountability']
  },

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  }
});