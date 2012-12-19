var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_form'),

  tagName : 'div',
  className : 'connection-form-container',

  events: {
    'submit .connection-form' : 'submitMetadataInput',
    'input #disbursed': 'updateDisbursed', 
    'input #pledged': 'updatePledged', 
    'change input[type=radio]': 'updateMoneyConnections',
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

    this.oldDisbursed = this.model.get('disbursed');
    this.oldPledged = this.model.get('pledged');

    this.editor = options.editor;
  },

  currentMoneyMode: function () {
    this.$('#' + config.get('moneyConnectionMode')).prop("checked", true);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){
    this.$el.attr('rel', this.model.id);
    this.$el.fadeIn(100);


    var _disbursed = this.model.get('disbursed');
    var _pledged = this.model.get('pledged');

    this.$('#disbursed').val(_disbursed);
    this.$('#pledged').val(_pledged);

    var elem = this.$el;
    var model = this.model;    

    this.$('#disbursed').numeric();
    this.$('#pledged').numeric();
    this.$el.draggable({handle: '.movable'});
    this.$el.css('position', 'absolute');

    $(document).on('click', this.destroy);

    this.currentMoneyMode();
    config.on('change:moneyConnectionMode', this.currentMoneyMode, this);

    var connectionFormView = this;
    _.defer(function(){
      connectionFormView.$('input#disbursed').focus();
    });
  },

  updateDisbursed: function () {
    var newDisbursed = this.$('#disbursed').val() || 0;
    this.model.set({disbursed: Number(newDisbursed)});
  },

  updatePledged: function () {
    var newPledged = this.$('#pledged').val() || 0;
    this.model.set({pledged: Number(newPledged)});
  },

  updateMoneyConnections: function (event) {
    config.set('moneyConnectionMode', event.currentTarget.id);
  },

  deleteConnection: function(){
    if(this.model) 
      this.model.destroy();

    this.destroy();
    return false;
  },

  closeConnectionForm:function(event){
    this.model.set({
      disbursed: this.oldDisbursed,
      pledged: this.oldPledged
    });
    $('#'+this.model.id).removeClass('activeConnection')
    this.destroy();
  },

  submitMetadataInput: function(e){
    e.preventDefault();
    var _disbursed = Number(this.$el.find('#disbursed').val());
    var _pledged = Number(this.$el.find('#pledged').val());

    this.model.save({
      disbursed: _disbursed,
      pledged: _pledged
    });

    var connectionID = this.$el.attr('rel');
    $('#'+connectionID).removeClass('activeConnection');

    this.destroy();
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    $(document).off('click', this.destory);
  }
});