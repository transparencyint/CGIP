var Model = require('./model');

module.exports = Model.extend({
  url: function(){
    if(this.id){
      return '/countries/' + this.id;
    }else{
      return '/countries'
    }
  },

  defaults : {
	 roleDimensions: [ -500, -250, 0, 250, 750 ],
   showMonitoring: true
  }
});