var View = require('./view');
var Import = require('models/import');
var ImportTableHeadlineView = require('./import_table_headline_view');
var ImportTableMatchingView = require('./import_table_matching_view');

module.exports = View.extend({
  id: 'import_headline',
  
  template: require('./templates/import_headline'),

  events : {
    'click #matchButton': 'loadMatchView'
  },

  initialize: function(options){
    this.model = options;
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

    //console.log(tableColumns);

    //Make other view invisible
    $('#import_table').hide();

    var model = this.model;
    console.log('loading match view');
    var tableMatchingView = new ImportTableMatchingView({model : model, tableColumns : tableColumns});
    tableMatchingView.render();
    this.$el.append(tableMatchingView.el);
  }

});
