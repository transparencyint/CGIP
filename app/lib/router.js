var application = require('application');
var ActorEditor = require('views/actor_editor');
var ImportView = require('views/import_view');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home',
    'edit/:country/money/import': 'import'
  },

  home: function() {
    var editor = new ActorEditor();
    editor.render();
    $('body').append( editor.el );
  },

  import: function(country) {
    options = {country: country};
    var importView = new ImportView(options);
    importView.render();
    $('body').append( importView.el );
  }
});