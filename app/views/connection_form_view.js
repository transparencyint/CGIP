var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_form'),

  tagName : 'div',
  className : 'connection-form-container',

  events: {
    'submit .connection-form' : 'submitMetadataInput',
    'click .deleteConnection': 'deleteConnection'
  },

  initialize: function(options){
    console.log(options);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    $('body').append(this.$el);

    this.$el.attr('id', this.model.id);
    this.$el.fadeIn(100);

    var amount = this.model.get('amount');
    if(typeof(amount) !== 'undefined')
      this.$el.find(".amount").val(amount);
    else
      this.$el.find(".amount").val('100000');

    var elem = this.$el;
    var model = this.model;

    /* Show the money slider */
    elem.find('.connection-money-slider').slider({

      orientation: "vertical",
      range: "min",
      min: 0,
      max: 20000000,
      value: amount,
      step: 100000,
      slide: function(event, ui) {
        elem.find('.amount').val(ui.value);
        /* manipulate the thickness of the the connection */
        model.set('amount', ui.value);
        model.save();
      }

    });

    if(!this.$el.hasClass('ui-draggable'))
      this.$el.draggable();
    
  },

  submitMetadataInput: function(e){
    e.preventDefault();
    var _amount = this.$el.find('.amount').val();

    this.model.save({
      amount: _amount
    });


  },

  deleteConnection: function(e){
    e.preventDefault();

    if(confirm('Are you sure you want to delete this connection?'))
    {
      this.model.destroy();
      this.$el.remove();
    }
  }
  
});