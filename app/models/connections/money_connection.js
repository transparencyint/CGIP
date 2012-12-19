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

    var editor = this.editor;

    var amountType = config.get('moneyConnectionMode');
    var amount = this.model.get('disbursed') || 0;

    console.log("--------------------");
    console.log("amount"+amount);
    var maxMoneyAmount = 0;
    var minMoneyAmount = 0;

    var size = editor.moneyConnections.models.length;
    
    //there is at least 1 other money connection on the map already
    if(size > 1){

      maxMoneyAmount = editor.getMaxConnection().get('disbursed');
      minMoneyAmount = editor.getMinConnection().get('disbursed');

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

        this.connections.each(this.appendConnection);
        //if(isMinOrMax) {
          // go through all moneyConnections and recalc all coinSizeFactors
          editor.moneyConnections.each(function(connection){
            console.log("connection.parent " + connection.parent);
            var amountDif = connection.get('disbursed') - minMoneyAmount;
            connection.coinSizeFactor = amountDif / moneyRange * factorRange + minCoinFactor;
            //console.log("connection.coinSizeFactor"+connection.coinSizeFactor);
          });
          /*_.each(editor.moneyConnections, function(connection){
            connection.createCoinDefinitions();
          });*/
        /*} else { //otherwise just calc for the current connection 
          var amountDif = amount - minMoneyAmount;
          this.coinSizeFactor = amountDif / moneyRange * factorRange + minCoinFactor;
          console.log("this.coinSizeFactor"+this.coinSizeFactor);
        } */

      } else { //there is at least 2 connection and all with the same money Amount
        editor.moneyConnections.each(function(connection){
          console.log("this.coinSizeFactor " + this.coinSizeFactor);
          connection.coinSizeFactor = minCoinFactor;
          //console.log("connection.coinSizeFactor"+connection.coinSizeFactor);
        });
        /*_.each(editor.moneyConnections, function(connection){
          connection.createCoinDefinitions();
        });*/
      }

    } else { // set minCoinSize for the first money connection
      console.log("first connection");
      editor.maxMoneyConnection = this.model;
      editor.minMoneyConnection = this.model;
      this.coinSizeFactor = this.minCoinSizeFactor;
      this.createCoinDefinitions();
    }

    //this.createCoinDefinitions();
    this.update();
  	
  }



});