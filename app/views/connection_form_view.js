var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_form'),

  tagName : 'div',
  className : 'connection-form-container',

  events: {
    'submit .connection-form' : 'submitMetadataInput',
    'input .amount': 'updateAmount', 
    'click': 'dontClose',
    'click .close': 'closeConnectionForm',
    'click .delete': 'deleteConnection'
  },

  dontClose: function(event){
    event.stopPropagation();
  },

  initialize: function(options){
    _.bindAll(this, 'destroy');
    this.saveAmount = _.debounce(this.saveAmount, 500);
    this.oldAmount = this.model.get('amount');
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
    this.$el.draggable({handle: '.movable'});
    this.$el.css('position', 'absolute');

    $(document).on('click', this.destroy);
  },

  updateAmount: function () {
    var newAmount = this.$('.amount').val();
    this.model.set({amount: Number(newAmount)});
  },

  deleteConnection: function(){
    if(this.model) 
      this.model.destroy();

    this.destroy();
    return false;
  },

  closeConnectionForm:function(event){
    this.model.set({amount: this.oldAmount});
    this.destroy();
  },

  submitMetadataInput: function(e){
    e.preventDefault();
    var _amount = Number(this.$el.find('.amount').val());
    this.model.save({
      amount: _amount
    });

    var connectionID = this.$el.attr('rel');
    $('#'+connectionID).removeClass('activeConnection');

    this.destroy();
  },

  destroy: function(){
    View.prototype.destroy.call(this);

    $(document).unbind('click', this.destory);
  }
});