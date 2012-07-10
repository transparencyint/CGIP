var View = require('./view');
var ConnectionListEntry = require('./connections_list_entry');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/connections_list'),
  tagName: 'table',
  id: 'money-connection-list',

  initialize: function(){
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.render, this);
  },

  addOne: function(connection){
    var newView = new ConnectionListEntry({model: connection, actors: this.options.actors});
    this.$el.append(newView.render().el);
  },

  render: function(){
    var list = this;

    this.$el.append(this.template());

    this.collection.each(function(connection){
      list.addOne(connection);
    });

    return this;
  }

});