var Collection = require('models/collection');
var Connection = require('./connection');
var AccountabilityConnections = require('./accountability_connections');
var MonitoringConnections = require('./monitoring_connections');
var MoneyConnections = require('./money_connections');

module.exports = Collection.extend({
  model: Connection,
  urlPart: '/connections',

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  },

  // returns an object with different collections for each connection type
  filterConnections: function(){
    var connections = {
      accountability: new AccountabilityConnections(),
      monitoring: new MonitoringConnections(),
      money: new MoneyConnections()
    };

    for(var connectionType in connections){
      // filter the current connections by its type
      var filtered = this.filter(function(connection){
        return connection.get('connectionType') == connectionType;
      });

      // add plain objects
      _.each(filtered, function(connection){
        connections[connectionType].add(connection.toJSON());
      });      
    }
    
    return connections;
  }
});