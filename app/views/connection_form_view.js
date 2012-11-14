var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_form'),

  tagName : 'div',
  className : 'connection-form-container',

  events: {
    'submit .connection-form' : 'submitMetadataInput',
    'change .amount': 'updateAmount', 
    'blur .amount': 'saveAmount'
  },

  initialize: function(options){
    this.saveAmount = _.debounce(this.saveAmount, 500);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    this.$el.attr('rel', this.model.id);
    this.$el.fadeIn(100);

    var amount = this.model.get('amount');
    if(typeof(amount) !== 'undefined')
      this.$('.amount').val(amount);

    var elem = this.$el;
    var model = this.model;    

    this.$('.amount').numeric();

    this.$('.amount').draggableInput({
      type: 'integer',
      min: 0,
      max: 10000000,
      scrollPrecision: 100000
    });

    this.$el.draggable({handle: '.movable'});
    this.$el.css('position', 'absolute');
  },

  updateAmount: function () {
    var newAmount = this.$('.amount').val();
    this.model.set({amount: newAmount});
    this.saveAmount();
  },

  saveAmount: function () {
    this.model.save();
  },

  submitMetadataInput: function(e){
    e.preventDefault();
    var _amount = this.$el.find('.amount').val();

    this.model.save({
      amount: _amount
    });

    var connectionID = this.$el.attr('rel');
    $('#'+connectionID).removeClass('activeConnection');

    this.destroy();
  }  
});