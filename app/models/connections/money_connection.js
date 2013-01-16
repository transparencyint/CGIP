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

  initialize: function(opts){
    Connection.prototype.initialize.call(this, opts);
    this.isZeroAmount = true;
    this.zeroCoinSize = 0.6;
    this.minCoinSizeFactor = 0.8;
    this.maxCoinSizeFactor = 2;
    this.coinSizeFactor = this.minCoinSizeFactor;
    this.on('change:disbursed', this.calculateCoinSize, this);
    this.on('change:pledged', this.calculateCoinSize, this);
    config.on('change:moneyConnectionMode', this.calculateCoinSize, this);
  },

  calculateCoinSize: function(){

    // Don't execute when the model hasn't been added to a collection yet
    if(!this.collection) return
    
    var amountType = config.get('moneyConnectionMode').replace('Mode','');
    var oldZeroAmount = this.isZeroAmount;
    this.isZeroAmount = this.get(amountType) === 0;
    if(this.isZeroAmount) {
      this.coinSizeFactor = this.zeroCoinSize;
      this.trigger('change:coinSizeFactor'); 
    }

    if(oldZeroAmount !== this.isZeroAmount) {
      this.trigger('change:isZeroAmount'); 
    }

    var size = this.collection.length;
    
    //there is at least 1 other money connection on the map already
    if(size > 1){
      var allZero = true;
      var amountTypeSelect = function(connection){ 
        var amount = connection.get(amountType);
        if(amount > 0) {
          allZero = false;
          return amount; 
        }
      };

      var min = this.collection.min(amountTypeSelect);
      var max = this.collection.max(amountTypeSelect);
      
      var maxMoneyAmount = 0;
      var minMoneyAmount = 0;
      if(!allZero) {
        maxMoneyAmount = max.get(amountType);
        minMoneyAmount = min.get(amountType);
      }

      var isMinMaxEqual = minMoneyAmount === maxMoneyAmount;
      var minCoinFactor = this.minCoinSizeFactor;

      //connections have at least 1 different money value
      //moneyRange can't be 0, because in a later calculation divide by 0 is not possible
      if(!isMinMaxEqual){
        var factorRange = this.maxCoinSizeFactor - minCoinFactor; 
        var moneyRange = Math.log(maxMoneyAmount - minMoneyAmount + 1);

        this.collection.each(function(connection){
          var amount = connection.get(amountType);
          if(amount !== 0) {
            var amountDif = Math.log(amount - minMoneyAmount + 1);
            var newCoinSize = amountDif / moneyRange * factorRange + minCoinFactor;
            
            if(connection.coinSizeFactor !== newCoinSize) {
              connection.coinSizeFactor = newCoinSize;
              connection.trigger('change:coinSizeFactor');     
            }
          }
          
        });
      }else {
        this.collection.each(function(connection){
          if(connection.coinSizeFactor !== minCoinFactor && connection.get(amountType) !== 0) {
            connection.coinSizeFactor = minCoinFactor;
            connection.trigger('change:coinSizeFactor');        
          }
        });
      }
    }

  }

});