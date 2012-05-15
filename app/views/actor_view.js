var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: {
    'click .name': 'startEditName',
    'dblclick .name': 'startEditName',
    'blur .nameInput': 'stopEditName',
    'keydown .nameInput': 'preventEnter'
  },
  
  initialize: function(){
    _.bindAll(this, 'stopMoving');
    this.model.on('change', this.render, this);
  },

  startEditName: function(event){
    this.$el.addClass('editingName');
    this.$el.draggable('disable');
  },
  
  stopEditName: function(event){
    this.$el.removeClass('editingName');
    var newValue = this.$('.nameInput').val()
    this.model.save('name', newValue);
    this.$el.draggable('enable');
  },
  
  preventEnter: function(event){
    if(event.keyCode === 13){
      event.preventDefault();
      this.stopEditName(event);
    }
  },
  
  stopMoving : function(){
    this.model.save({ 
      'pos' : {
        x : this.$el.offset().left + this.$el.width()/2,
        y : this.$el.offset().top + this.$el.width()/2
      }
    });
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var pos = this.model.get('pos');
    var name = this.model.get('name');
    
    this.$el.css({
      left : pos.x,
      top : pos.y
    });

    // only add the draggable if it's not already set
    if(!this.$el.hasClass('ui-draggable'))
      this.$el.draggable({
        stop: this.stopMoving
      });

    this.nameElement = this.$el.find('.name');
  },
});