var Actor = require('./actor');

module.exports = Backbone.Collection.extend({
  model: Actor,
  url: '/actors'
});