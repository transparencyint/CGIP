var View = require('./view');

module.exports = View.extend({
  template: require('./templates/legend'),
  className: 'light legend controls',
  
  events: function() {
    var _events = {
      'click': 'stopPropagation',
    
      // the show/hide button
      'click .toggle': 'toggle'
    };

    // bind dynamic input event (touch or mouse)
    _events[ this.inputDownEvent] = 'stopPropagation';
    _events[ this.inputDownEvent + ' .state'] = 'toggleState';

    return _events;
  },

  getRenderData: function() {
    return {
      type: this.options.available
    };
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  toggle: function(){
    this.$el.toggleClass('visible');
  },
  
  toggleState: function(event){
    var element = $(event.target);
    var type = element.attr('data-type');
    var shouldHide = element.hasClass('visible');
    
    if(shouldHide){
      // hide type
      element.removeClass('visible');
      this.options.holder.addClass('hide-' + type);
    } else {
      // show type
      element.addClass('visible');
      this.options.holder.removeClass('hide-' + type);
    }
  }
});