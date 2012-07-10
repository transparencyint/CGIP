var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connections_list_entry'),
  tagName: 'tr',

  events: {
    'mouseover td': 'showEditField',
    'blur input': 'hideEditField'
  },

  initialize: function(){
    _.bindAll(this, 'actorChanged');
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
    var newFrom = this.$('.from-actors-select').val();
    var newTo = this.$('.to-actors-select').val();

    if(newFrom !== newTo){
      // none means no connection
      if(newTo == 'none') newTo = null;
      if(newFrom == 'none') newFrom = null;

      this.model.save({from: newFrom, to: newTo});
    }else
      alert('A connection has to have two different actors.');
  },

  getRenderData: function(){
    var data = this.model.toJSON()
    data.actors = this.options.actors.toJSON();
    return data;
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