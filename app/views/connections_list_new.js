var View = require('./view');
var utils = require('../lib/utils');
var MoneyConnection = require('../models/connections/money_connection');

module.exports = View.extend({

  template: require('./templates/connections_list_new'),
  dropDownTemplate: require('./templates/connections_list_actors_options'),

  events: {
    'click #create': 'createConnection'
  },

  createConnection: function(){
    var data = {};
    data.from = utils.sanitizeConnectionVal(this.$('#from-actors-select').val());
    data.to = utils.sanitizeConnectionVal(this.$('#to-actors-select').val());
    data.disbursed = this.$('#disbursed').val();
    data.pledged = this.$('#pledged').val();
    data.source = this.$('#source').val();
    data.country = this.collection.country;

    var model = new MoneyConnection(data);
    model.on('error', function(model, error){
      alert(error);
    });
    
    this.collection.create(model, {wait: true});
  },

  getRenderData: function(){
    var data = {};
    data.actors = this.options.actors.toJSON();
    return data;
  },

  render: function(){
    // render the normal template
    var data = this.getRenderData();
    this.$el.html(this.template(data));

    // render the dropdown-menus
    this.$('#from-actors-select').html(this.dropDownTemplate(data));
    this.$('#to-actors-select').html(this.dropDownTemplate(data));

    this.afterRender();
    return this;
  },

  afterRender: function(){
    // select the none option on default
    this.$('#from-actors-select option').last().attr('selected', 'selected');
    this.$('#to-actors-select option').last().attr('selected', 'selected');
  }
});