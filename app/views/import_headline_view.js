var View = require('./view');
var Import = require('models/import');
var ImportTableHeadlineView = require('./import_table_headline_view');

module.exports = View.extend({
  id: 'import_headline',
  
  template: require('./templates/import_headline'),

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
});
