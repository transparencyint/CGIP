// Base class for all collections.
module.exports = Backbone.Collection.extend({
  url: function(){
    if(!this.country) throw('You need to specify a country for the collection.');
    if(!this.urlPart) throw('You need to specify a urlPart for the collection');

    return '/' + this.country + this.urlPart;
  },

  country: 'dm',
  
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
