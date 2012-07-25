var View = require('./view');
var ConnectionListEntry = require('./connections_list_entry');
var ConnectionListNew = require('./connections_list_new');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/connections_list'),

  events: {
    'click #new-connection': 'toggleNewForm'
  },

  initialize: function(){
    this.collection.on('add', this.addOne, this);
    this.collection.on('add', this.removeNewForm, this);
    this.collection.on('reset', this.render, this);
  },

  addOne: function(connection){
    var newView = new ConnectionListEntry({model: connection, actors: this.options.actors});
    this.$('tbody').append(newView.render().el);
  },

  toggleNewForm: function(){
    if(!this.newFormView){
      this.newFormView = new ConnectionListNew({
        actors: this.options.actors,
        collection: this.collection
      });
      this.$('#new-connection-container').html(this.newFormView.render().el);
    }else{
      this.removeNewForm();
    }
  },

  removeNewForm: function(){
    this.newFormView.destroy();
    this.newFormView = null;
  },

  getRenderData: function(){
    var data =  {}
    data.country = this.options.actors.country;
    data.actors = this.options.actors.toJSON();
    return data;
  },

  render: function(){
    var list = this;

    this.$el.empty().append(this.template(this.getRenderData()));

    this.collection.each(function(connection){
      list.addOne(connection);
    });

    return this;
  }

});