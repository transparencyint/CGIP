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
	 roleDimensions: [ -700, -350, 0, 350, 700 ],
   showMonitoring: true
  }
});