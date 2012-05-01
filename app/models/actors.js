var Actor = require('./actor');

module.exports = Backbone.Collection.extend({
  url: '/actors',
  model: Actor
});