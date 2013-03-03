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

  // We the 3 different tickness variables the range for the tickness will be determined.
  // This constances can be changed, which will effect the tickness of all money lines.
  initialize: function(opts){
    Connection.prototype.initialize.call(this, opts);
    this.isEmptyAmount = true;
    this.emptyAmountTicknessFactor = 0.6;
    this.minTicknessFactor = 0.8;
    this.maxTicknessFactor = 2;
    this.ticknessFactor = this.minTicknessFactor;
    this.on('change:disbursed', this.calculateLineTickness, this);
    this.on('change:pledged', this.calculateLineTickness, this);
    config.on('change:moneyConnectionMode', this.calculateLineTickness, this);
  },

  // The thickness of the money lines will be determined by comparing the money amount of each money connection
  calculateLineTickness: function(){

    // Don't execute when the model hasn't been added to a collection yet
    if(!this.collection) return
    
    var amountType = config.get('moneyConnectionMode').replace('Mode','');

    // If the current money connection has no amount give it the empty tickness factor.
    var oldIsEmptyAmount = this.isEmptyAmount;
    this.isEmptyAmount = this.get(amountType) === 0;
    if(this.isEmptyAmount) {
      this.ticknessFactor = this.emptyAmountTicknessFactor;
      this.trigger('change:ticknessFactor'); 
    }

    if(oldIsEmptyAmount !== this.isEmptyAmount) {
      this.trigger('change:isEmptyAmount'); 
    }

    var size = this.collection.length;
    
    // In case there is 1 or more other money connection on the map you need to calculate the line tickness 
    if(size > 1){

      var allEmptyAmount = true;
      var amountTypeSelect = function(connection){ 
        var amount = connection.get(amountType);
        if(amount > 0) {
          allEmptyAmount = false;
          return amount; 
        }
      };

      var min = this.collection.min(amountTypeSelect);
      var max = this.collection.max(amountTypeSelect);
      
      var maxMoneyAmount = 0;
      var minMoneyAmount = 0;
      if(!allEmptyAmount) {
        maxMoneyAmount = max.get(amountType);
        minMoneyAmount = min.get(amountType);
      }

      var isMinMaxEqual = minMoneyAmount === maxMoneyAmount;
      var minFactor = this.minTicknessFactor;

      // In case connections have at least 1 different money value we compare them
      if(!isMinMaxEqual){
        var factorRange = this.maxTicknessFactor - minFactor; 
        var moneyRange = Math.log(maxMoneyAmount - minMoneyAmount + 1);

        // The actual calculation for the tickness happens here.
        // All money connections get an tickness factor assigned according the money amount.
        // The factor is calculated logarithically.
        this.collection.each(function(connection){
          var amount = connection.get(amountType);
          if(amount !== 0) {
            var amountDif = Math.log(amount - minMoneyAmount + 1);
            var newTickness = amountDif / moneyRange * factorRange + minFactor;
            
            if(connection.ticknessFactor !== newTickness) {
              connection.ticknessFactor = newTickness;
              connection.trigger('change:ticknessFactor');     
            }
          }
          
        });
      }
      // Otherwise all money lines get the minimum tickness Factor
      else {
        this.collection.each(function(connection){
          if(connection.ticknessFactor !== minFactor && connection.get(amountType) !== 0) {
            connection.ticknessFactor = minFactor;
            connection.trigger('change:ticknessFactor');        
          }
        });
      }
    }

  }

});