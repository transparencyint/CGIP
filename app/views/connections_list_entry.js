var View = require('./view');
var utils = require('../lib/utils');

module.exports = View.extend({

  template: require('./templates/connections_list_entry'),
  dropDownTemplate: require('./templates/connections_list_actors_options'),
  tagName: 'tr',

  events: {
    'mouseover td': 'showEditField',
    'blur input': 'hideEditField',
    'click button': 'askDestroy'
  },

  initialize: function(){
    View.prototype.initialize.call(this);

    _.bindAll(this, 'actorChanged');
    
    this.autoSaveConnections = true;

    this.model.on('destroy', this.destroy, this);
    this.model.on('error', this.alertError, this);

    // debounce changes
    this.model.save = _.debounce(this.model.save, 500);
  },

  askDestroy: function(){
    if(confirm(t('Are you sure you want to delete this connection?')))
      this.model.destroy();
  },

  showEditField: function(event){
    $(event.currentTarget).addClass('edit').find('input').focus();
  },

  hideEditField: function(event){
    var input = $(event.currentTarget);
    
    input.parent('td').removeClass('edit');

    var value = input.val();
    var modelAttribute = input.data('model-attribute');
    var modelValue = this.model.get(modelAttribute);

    if(String(value) != String(modelValue)){
      // parse the input to Strings
      if(modelAttribute == 'disbursed' || modelAttribute == 'pledged')
        value = parseInt(value, 10) || 0;

      this.model.set(modelAttribute, value);

      this.model.save()
      input.siblings('span').text(value);
    }
  },

  renderSelect: function(element, select, exclude){
    element.unbind('change');
    
    var actors = this.options.actors.toJSON();
    if(exclude){
      var found = _.find(actors, function(actor){ return actor._id == exclude});
      actors = _.without(actors, found);
    }

    element.empty().html(this.dropDownTemplate({actors: actors}));
    
    if(select)
      element.find('option[value=' + select + ']').attr('selected', 'selected');
    else
      element.find('option').last().attr('selected', 'selected');

    element.bind('change', this.actorChanged);
  },

  actorChanged: function(event){
    var row = this;
    var newFrom = utils.sanitizeConnectionVal(this.$('.from-actors-select').val());
    var newTo = utils.sanitizeConnectionVal(this.$('.to-actors-select').val());

    var currentSelect = $(event.currentTarget);
    var changeThisSelect = currentSelect.hasClass('from-actors-select') ? this.$('.to-actors-select') : this.$('.from-actors-select');
    var currentVal = utils.sanitizeConnectionVal(currentSelect.val());
    var changeVal = utils.sanitizeConnectionVal(changeThisSelect.val());
    
    row.renderSelect(changeThisSelect, changeVal, currentVal);

    if(this.autoSaveConnections) this.model.save({from: newFrom, to: newTo});
  },

  getRenderData: function(){
    var data = this.model.toJSON()
    data.actors = this.options.actors.toJSON();
    return data;
  },

  render: function(){
    // render the normal template
    var data = this.getRenderData();
    this.$el.html(this.template(data));

    // render the dropdown-menus
    this.renderSelect(this.$('.from-actors-select'), data.from, data.to);
    this.renderSelect(this.$('.to-actors-select'), data.to, data.from);

    this.afterRender();
    return this;
  }
});