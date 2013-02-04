var View = require('views/view');
var ImportMatchingView = require('./import_matching_view');

module.exports = View.extend({
  
  template: require('views/templates/csv_import/import_headline'),

  events : {
    'click #matchButton': 'loadMatchView'
  },

  initialize: function(options){
    this.country = options.country;
  },

  getRenderData: function() {
  },


  afterRender: function(){
      this.$('#headlines li').draggable({
        revert: true,
        revertDuration: 100
      });
  },

  /**
    Displays table with the matched actors
  **/
  loadMatchView: function(){
    var selectedColumns = new Array();
    var i = 0;

    //Get the positions of the dragged buttons
    $('#import_table th').each(function(){
      var divID = $(this).find('div').attr('id');

      if(divID)
        selectedColumns[i] = divID;
      else
        selectedColumns[i] = null;
      
      i++;
    });

    $('#import_table').hide();

    var csvdata = this.model;
    var matchingView = new ImportMatchingView({model : csvdata, selectedColumns : selectedColumns, country: this.country});
    matchingView.render();
    this.$el.empty().append(matchingView.el);
  }

});
