var View = require('./view');
var ActorEditor = require('./actor_editor');

module.exports = View.extend({

  initialize: function(){
    this.initializeProperties();

    $(document).on('viewdrag', this.unScopeElements);
    // actor selection
    $(document).on('viewSelected', this.selected);

    _.bindAll(this, 'unScopeElements', 'closeMoneyModal', 'selected', 'realignOrigin', 'keyUp', 'slideZoom', 'panStop', 'pan', 'placeActorDouble', 'slideInDouble');
  },

  initializeProperties: ActorEditor.prototype.initializeProperties,
  unScopeElements: ActorEditor.prototype.unScopeElements,
  selected: ActorEditor.prototype.selected,
  scopeElements: ActorEditor.prototype.scopeElements,
  closeMoneyModal: ActorEditor.prototype.closeMoneyModal

});