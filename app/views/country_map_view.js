var View = require('./view');
var ActorEditor = require('./actor_editor');

module.exports = View.extend({

  initialize: function(){
    this.initializeProperties();

    $(document).on('viewdrag', this.unScopeElements);
    // actor selection
    $(document).on('viewSelected', this.selected);
  },

  initializeProperties: ActorEditor.prototype.initializeProperties,
  unScopeElements: ActorEditor.prototype.unScopeElements,
  selected: ActorEditor.prototype.selected,
  scopeElements: ActorEditor.prototype.scopeElements

});