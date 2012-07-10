var Actor = require('./actor');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Actor,
  urlPart: '/actors',
  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
    
  }
});