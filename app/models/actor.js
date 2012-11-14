module.exports = Backbone.Model.extend({

  url: function(){
    if(!this.has('country')) throw('In order to create an actor you have to specify a country.');
    var url = '/' + this.get('country') + '/actors';
    if(this.id)
      url += '/' + this.id
    return url;
  },

  defaults : {
    name: '',
    abbreviation: '',
    type: 'actor'
  },

  moveByDelta: function(delta){
    var thisPos = _.clone(this.get('pos'));
    thisPos.x += delta.x;
    thisPos.y += delta.y;
    this.set('pos', thisPos);
  }

});