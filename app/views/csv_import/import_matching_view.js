var View = require('views/view');
var MoneyConnections = require('models/connections/money_connections');
var ImportTableMatchingView = require('./import_table_matching_view');

module.exports = View.extend({
  
  template: require('views/templates/csv_import/import_matching'),

  events : {
    'click #confirmButton': 'createConnections'
  },

  initialize: function(options){
    this.selectedColumns = options.selectedColumns;
    this.country = options.country;
  },

  /**
    Shows the table with the matched actors marked in green
  **/
  afterRender: function(){
    var csvdata = this.model;
    this.tableMatchingView = new ImportTableMatchingView({model : csvdata, selectedColumns : this.selectedColumns, country: this.country});
    this.tableMatchingView.render();
    this.$el.append(this.tableMatchingView.el);
  },

  /**
    Saves the created money connections to the database
  **/
  createConnections: function(){
    var oldMoneyConnections = new MoneyConnections();
    oldMoneyConnections.country = this.country;
    var tableMatchingView = this.tableMatchingView;
    oldMoneyConnections.fetch({
      success: function(){
        if(confirm("<%= t('confirmation_delete_money_connections') %>"))
        {
          oldMoneyConnections.destroyAll({
            success: function(){
              
              tableMatchingView.newMoneyConnections.each(function(connection){
                connection.save();
              }); 

              $('#successInfo').show();
              $('#confirmInfo').hide();
              $('#confirmButton').hide(); 
              
            },
            error: function(){
              $('#failureInfo').show(); 
            }
          });

        }
      }
    });
  }

});
