// Base class for all collections.
module.exports = Backbone.Collection.extend({
  initialize: function(){
    // call super method
    Backbone.Model.prototype.initialize.call(this);
  }
});
