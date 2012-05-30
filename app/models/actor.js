module.exports = Backbone.Model.extend({
  url: '/actors',

  defaults : {
    name : ''
  },

  moveByDelta: function(delta){
    var thisPos = _.clone(this.get('pos'));
    thisPos.x += delta.x;
    thisPos.y += delta.y;
    this.set('pos', thisPos);
  }

});