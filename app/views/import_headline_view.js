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

  initialize: function(){
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
    console.log('loading match view');
    var tableMatchingView = new ImportTableMatchingView({model : model});
    tableMatchingView.render();
    this.$el.append(tableMatchingView.el);
  }

});
