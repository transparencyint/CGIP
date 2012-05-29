// Base class for all collections.
module.exports = Backbone.Collection.extend({
  initialize: function(){
    // call super method
    Backbone.Model.prototype.initialize.call(this);
  },

  destroyAll: function(options){
    if(!options) options = {};
    if(!options.success) options.success = function(){};
    if(!options.error) options.error = function(){};

    var docs = {
      docs: this.toJSON()
    };

    var db = Backbone.couch_connector.helpers.make_db();

    db.bulkRemove(docs, {
      success: function(){
        options.success();
      },
      error: function(errNr, errMsg){
        options.error(errNr, errMsg);
      }
    });
  }
});
