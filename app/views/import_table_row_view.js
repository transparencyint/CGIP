var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_row'),
  
  tagName : 'tr',
  className : '',

  initialize: function(options){
  	this.availableActor = options.availableActor;
  	//console.log(options.availableActor);
  	
  },
  
  getRenderData : function(){
		return this.model;
  },

  afterRender: function(){

  },

  setMarkedActor: function(matchedActorID){
    console.log(matchedActorID);
    $(this.el).addClass('matchedRow');
  },

  
});