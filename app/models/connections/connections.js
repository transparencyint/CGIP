var Collection = require('models/collection');
var Connection = require('./connection');
var AccountabilityConnection = require('./accountability_connection');
var AccountabilityConnections = require('./accountability_connections');
var MoneyConnection = require('./money_connection');
var MoneyConnections = require('./money_connections');

var types = {
  accountability: AccountabilityConnection,
  money: MoneyConnection
};

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
      money: new MoneyConnections()
    };

    var filtered;
    for(connectionType in connections){
      // filter the current connections by its type
      filtered = this.filter(function(connection){
        return connection.get('connectionType') == connectionType;
      });
      // set the correct model of the current collection
      connections[connectionType].model = types[connectionType];
      // add the models to the collection
      connections[connectionType].reset(filtered);
    }
    filtered = null;

    return connections;
  }
});