var View = require('./view');
var Import = require('models/import');
var ImportTableHeadlineView = require('./import_table_headline_view');
var ImportTableMatchingView = require('./import_table_matching_view');
var MoneyConnections = require('models/connections/money_connections');

module.exports = View.extend({
  id: 'import_headline',
  
  template: require('./templates/import_headline'),

  events : {
    'click #matchButton': 'loadMatchView',
    'click #confirmButton': 'createConnections'
  },

  initialize: function(options){
    this.model = options.model;
  },

  afterRender: function(){
      this.$('#headlines li').draggable({
        revert: true,
        revertDuration: 100,
        stop: function(event,ui){
          //console.log(event.target);
        }
      });
  },

  loadMatchView: function(){
    var tableColumns = new Array();
    var i = 0;

    //Get the positions of the dragged buttons
    $('#import_table th').each(function(){
      var divID = $(this).find('div').attr('id');

      if(divID)
        tableColumns[i] = divID;
      else
        tableColumns[i] = null;
      
      i++;
    });

    //Make other view invisible
    $('#import_table').hide();
    //Make button invisible
    $('#matchButton').hide();
    $('#matchInfo').hide();
    $('#confirmInfo').show();
    $('#confirmButton').show();

    var model = this.model;
    console.log('loading match view');
    this.tableMatchingView = new ImportTableMatchingView({model : model, tableColumns : tableColumns});
    this.tableMatchingView.render();
    this.$el.append(this.tableMatchingView.el);
  },

  createConnections: function(){
    var oldMoneyConnections = new MoneyConnections();
    var tableMatchingView = this.tableMatchingView;
    oldMoneyConnections.fetch({
      success: function(){
        if(confirm('This will delete all previous money connections, Are you sure?'))
        {
          oldMoneyConnections.destroyAll({
            success: function(){
              //debugger
              tableMatchingView.newMoneyConnections.each(function(connection){
                connection.save();
              });    
            }
          });
          
        }
      }
    });
  }

});
