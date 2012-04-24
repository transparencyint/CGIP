var View = require('./view');

module.exports = View.extend({
  
  template: require('./templates/actor'),
  
  className : 'actor',
  
  initialize: function(){
    
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var pos = this.model.get('pos');
    this.$el.css({
      left : pos.x,
      top : pos.y,
    });
  },
});