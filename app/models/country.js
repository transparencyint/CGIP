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
	 roleDimensions: [ -700, -300, 300, 600, 900 ],
   showMonitoring: true
  },

  moveByDelta: function(dx, dy){
    var thisPos = _.clone(this.get('pos'));
    thisPos.x += dx;
    thisPos.y += dy;
    this.set('pos', thisPos);
  }
});