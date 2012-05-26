var Actor = require('./actor');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Actor,
  url: '/actors',
  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
    
  }
});