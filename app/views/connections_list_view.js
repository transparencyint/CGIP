var View = require('./view');
var ConnectionListEntry = require('./connections_list_entry');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/connections_list'),

  initialize: function(){
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.render, this);
  },

  addOne: function(connection){
    var newView = new ConnectionListEntry({model: connection, actors: this.options.actors});
    this.$('tbody').append(newView.render().el);
  },

  getRenderData: function(){
    var data =  {}
    data.country = this.options.actors.country;
    data.actors = this.options.actors.toJSON();
    return data;
  },

  render: function(){
    var list = this;

    this.$el.append(this.template(this.getRenderData()));

    this.collection.each(function(connection){
      list.addOne(connection);
    });

    return this;
  }

});