var Collection = require('models/collection');
var AccountabilityConnection = require('./accountability_connection');

module.exports = Collection.extend({
  model: AccountabilityConnection,
  urlPart: '/connections/accountability',

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  }
});