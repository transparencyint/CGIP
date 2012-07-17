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
    _.bindAll(this, 'actorChanged');
    
    this.model.on('destroy', this.destroy, this);
    this.model.on('error', this.alertError, this);
  },

  askDestroy: function(){
    if(confirm('Are you sure you want to delete this connection?'))
      this.model.destroy();
  },

  showEditField: function(event){
    var spanElement = $('span', event.currentTarget);
    var inputElement = spanElement.siblings('input');
    inputElement.show();
    inputElement.focus();
    spanElement.hide();
  },

  hideEditField: function(event){
    var currentElement = $(event.currentTarget);
    var spanElement = currentElement.siblings('span');
    spanElement.show();
    currentElement.hide();

    var value = currentElement.val();
    var modelAttribute = currentElement.data('model-attribute');
    var modelValue = this.model.get(modelAttribute);
    
    if(String(value) != String(modelValue)){
      this.model.set(modelAttribute, value);
      this.model.save()
      spanElement.text(value);
    }
  },

  actorChanged: function(){
    var newFrom = utils.sanitizeConnectionVal(this.$('.from-actors-select').val());
    var newTo = utils.sanitizeConnectionVal(this.$('.to-actors-select').val());

    this.model.save({from: newFrom, to: newTo});
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
    this.$('.from-actors-select').html(this.dropDownTemplate(data));
    this.$('.to-actors-select').html(this.dropDownTemplate(data));

    this.afterRender();
    return this;
  },

  afterRender: function(){
    // select the current actors
    var from = this.model.get('from');
    var to = this.model.get('to');
    if(from)
      this.$('.from-actors-select option[value=' + from + ']').attr('selected', 'selected');
    else
      this.$('.from-actors-select option').last().attr('selected', 'selected');
    if(to)
      this.$('.to-actors-select option[value=' + to + ']').attr('selected', 'selected');
    else
      this.$('.to-actors-select option').last().attr('selected', 'selected');

    // bind to select changes
    this.$('.from-actors-select, .to-actors-select').change(this.actorChanged);
  }
});