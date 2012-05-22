var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_row'),
  
  tagName : 'tr',
  
  initialize: function(options){
  	console.log(options);
  },
  
  getRenderData : function(){
    return this.model;
  },
  
  setActors: function(actors){
  	this.actors = actors;
  },

  afterRender: function(){
  	console.log(this.actors);
  	//console.log("Model");
  	//console.log(this.model);
  }
});