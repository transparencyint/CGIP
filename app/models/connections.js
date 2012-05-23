var Connection = require('./connection');
var Collection = require('./collection');
var AccountabilityConnection = require('./accountability_connection');
var MoneyConnection = require('./money_connection');

var types = {
  accountability: AccountabilityConnection,
  money: MoneyConnection
};

module.exports = Collection.extend({
  model: Connection,
  url: '/connections',

  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
  },

  // returns an object with different collections for each connection type
  filterConnections: function(){
    var connections = {
      accountability: new Collection(),
      money: new Collection
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