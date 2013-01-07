var Connection = require('./connection');

module.exports = Connection.extend({
  defaults: function(){
    // add the money connectiontype to the defaults
    var data = Connection.prototype.defaults.call(this);
    data.connectionType = 'money';
    data.pledged = 0;
    data.disbursed = 0;
    return data;
  },

  initialize: function(){
    this.minCoinSizeFactor = 1;
    this.maxCoinSizeFactor = 4;
    this.coinSizeFactor = this.minCoinSizeFactor;
    this.on('change:disbursed', this.calculateCoinSize, this);
    this.on('change:pledged', this.calculateCoinSize, this);
    config.on('change:moneyConnectionMode', this.calculateCoinSize, this);
      
  },

  calculateCoinSize: function(){

    // Don't execute when the model hasn't been added to a collection yet
    if(!this.collection) return
    
    var amountType = config.get('moneyConnectionMode').replace('Mode','');
    var amount = this.get(amountType);
    var maxMoneyAmount = 0;
    var minMoneyAmount = 0;

    var size = this.collection.length;
    
    //there is at least 1 other money connection on the map already
    if(size > 1){
      var amountTypeSelect = function(connection){ return connection.get(amountType); };
      maxMoneyAmount = this.collection.max(amountTypeSelect).get(amountType);
      minMoneyAmount = this.collection.min(amountTypeSelect).get(amountType);

      var isMinMaxEqual = minMoneyAmount === maxMoneyAmount;
      var minCoinFactor = this.minCoinSizeFactor;

      //connections have at least 1 different money value
      //moneyRange can't be 0, because in a later calculation divide by 0 is not possible
      if(!isMinMaxEqual){
        var factorRange = this.maxCoinSizeFactor - minCoinFactor; 
        var moneyRange = maxMoneyAmount - minMoneyAmount;

        this.collection.each(function(connection){
          var amountDif = connection.get(amountType) - minMoneyAmount;
          var newCoinSize = amountDif / moneyRange * factorRange + minCoinFactor;
          if(connection.coinSizeFactor !== newCoinSize) {
            connection.coinSizeFactor = newCoinSize;
            console.log("if ");
            console.log("connection.coinSizeFactor " + connection.coinSizeFactor);
            console.log("connection.get(amountType)" + connection.get(amountType));
            connection.trigger('change:coinSizeFactor');
            
          }
        });
      }else {
        this.collection.each(function(connection){
          if(connection.coinSizeFactor !== minCoinFactor) {
            connection.coinSizeFactor = minCoinFactor;
            console.log("else ");
            console.log("connection.coinSizeFactor " + connection.coinSizeFactor);
            console.log("connection.get(amountType)" + connection.get(amountType));
            connection.trigger('change:coinSizeFactor');
            
          }
        });
      }
    }

  }

});