var View = require('./view');
var EntryView = require('./connections_list_entry');
var utils = require('../lib/utils');
var MoneyConnection = require('../models/connections/money_connection');

module.exports = View.extend({

  template: require('./templates/connections_list_new'),
  dropDownTemplate: require('./templates/connections_list_actors_options'),

  events: {
    'click #create': 'createConnection'
  },
  
  tagName: 'table',
  className: 'moneyList',

  initialize: function(){
    View.prototype.initialize.call(this);

    // borrow two methods from the entry view
    this.actorChanged = EntryView.prototype.actorChanged;
    this.renderSelect = EntryView.prototype.renderSelect;
    _.bindAll(this, 'actorChanged');
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
  
  adaptWidth: function(){
    var tds = this.$el.find('td');
    var currentTds = $('#money-connection-list tbody tr:first-child td');
    
    tds.each(function(i, td){
      $(td).width( currentTds.eq(i).innerWidth() );
    });
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

    // render the select elements and bind to events
    this.renderSelect(this.$('.from-actors-select'), null, null);
    this.renderSelect(this.$('.to-actors-select'), null, null);

    this.afterRender();
    this.adaptWidth();
    
    return this;
  }
});