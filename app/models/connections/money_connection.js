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

  calculateCoinSize: function(){
    debugger
    var amountType = config.get('moneyConnectionMode').replace('Mode','');
    var amount = this.get(amountType);

    console.log("--------------------");
    console.log("amount"+amount);
    var maxMoneyAmount = 0;
    var minMoneyAmount = 0;

    var size = this.collection.length;
    
    //there is at least 1 other money connection on the map already
    if(size > 1){
      maxMoneyAmount = this.collection.min(function(connection){return connection.get(amountType)}).get(amountType);
      minMoneyAmount = this.collection.max(function(connection){return connection.get(amountType)}).get(amountType);

      console.log("minMoneyAmount"+minMoneyAmount);
      console.log("maxMoneyAmount"+maxMoneyAmount);

      var isMinMaxEqual = minMoneyAmount === maxMoneyAmount;
      var minCoinFactor = this.minCoinSizeFactor;

      //connections have at least 1 different money value
      //moneyRange can't be 0, because in a later calculation divide by 0 is not possible
      if(!isMinMaxEqual){
        var factorRange = this.maxCoinSizeFactor - minCoinFactor; 
        var moneyRange = maxMoneyAmount - minMoneyAmount;

        console.log("factorRange"+factorRange);
        console.log("moneyRange"+moneyRange);

        this.collection.each(function(connection){
          var amountDif = connection.get(amountType) - minMoneyAmount;
          connection.coinSizeFactor = amountDif / moneyRange * factorRange + minCoinFactor;
          connection.trigger('change:coinSizeFactor');
        });
      } else { // set minCoinSize for the first money connection
        this.coinSizeFactor = this.minCoinSizeFactor;
      }
    }

  }

});