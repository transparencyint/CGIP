var Collection = require('models/collection');
var MonitoringConnection = require('./monitoring_connection');

module.exports = Collection.extend({
  model: MonitoringConnection,
  urlPart: '/connections/monitoring',

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  }
});