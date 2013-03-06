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

  // The thickness is calculated with thress constants (minThickness, maxThickness, emptyAmount).
  // These constants can be changed, which will effect the thickness of all money lines.
  initialize: function(opts){
    Connection.prototype.initialize.call(this, opts);
    this.isEmptyAmount = true;
    this.emptyAmountThicknessFactor = 0.6;
    this.minThicknessFactor = 0.8;
    this.maxThicknessFactor = 2;
    this.thicknessFactor = this.minThicknessFactor;
    this.on('change:disbursed', this.calculateLineThickness, this);
    this.on('change:pledged', this.calculateLineThickness, this);
    config.on('change:moneyConnectionMode', this.calculateLineThickness, this);
  },

  // The thickness of the money lines will be determined by comparing the money amount of all money connections.
  calculateLineThickness: function(){

    // Don't execute when the model hasn't been added to a collection yet
    if(!this.collection) return
    
    var amountType = config.get('moneyConnectionMode').replace('Mode','');

    // If the current money connection has no amount give it the empty thickness factor.
    var oldIsEmptyAmount = this.isEmptyAmount;
    this.isEmptyAmount = this.get(amountType) === 0;
    if(this.isEmptyAmount) {
      this.thicknessFactor = this.emptyAmountThicknessFactor;
      this.trigger('change:thicknessFactor'); 
    }

    if(oldIsEmptyAmount !== this.isEmptyAmount) {
      this.trigger('change:isEmptyAmount'); 
    }

    var size = this.collection.length;
    
    // In case there is 1 or more other money connections on the map you need to calculate the line thickness 
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
      var minFactor = this.minThicknessFactor;

      // In case connections have at least 1 different money value we compare them.
      if(!isMinMaxEqual){
        var factorRange = this.maxThicknessFactor - minFactor; 
        var moneyRange = Math.log(maxMoneyAmount - minMoneyAmount + 1);

        // The actual calculation for the thickness happens here.
        // All money connections get a thickness factor assigned according to their money amount.
        // The factor is calculated logarithically.
        this.collection.each(function(connection){
          var amount = connection.get(amountType);
          if(amount !== 0) {
            var amountDif = Math.log(amount - minMoneyAmount + 1);
            var newThickness = amountDif / moneyRange * factorRange + minFactor;
            
            if(connection.thicknessFactor !== newThickness) {
              connection.thicknessFactor = newThickness;
              connection.trigger('change:thicknessFactor');     
            }
          }
          
        });
      }
      // Otherwise all money lines get the minimum thickness factor
      else {
        this.collection.each(function(connection){
          if(connection.thicknessFactor !== minFactor && connection.get(amountType) !== 0) {
            connection.thicknessFactor = minFactor;
            connection.trigger('change:thicknessFactor');        
          }
        });
      }
    }

  }

});