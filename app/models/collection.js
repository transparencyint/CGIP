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

    var models = { models: this.toJSON() };

    $.ajax({
      type: 'POST',
      url: '/' + this.country + this.urlPart + '/destroyAll',
      data: models,
      success: function(){
        options.success();
      },
      error: function(errNr, errMsg){
        options.error(errNr, errMsg);
      }
    });
  }
});
