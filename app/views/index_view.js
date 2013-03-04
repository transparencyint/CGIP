// The starting point for the audience. The static map shows all the chapter countries.
// From here you can enter the map of a specific country. Also the usual like Privacy and Impress are linked.
// In case a authentificated user (editor) is logged in, that will be seen there as well and the user can switch
// to the edit view. 

var View = require('./view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'box center',

  template: require('./templates/index'),
  
  initialize: function(){
    _.bindAll(this, 'fadeInCountries');
  },

  getRenderData: function() {
    return {
      countries: this.options.countries.toJSON()
    };
  },
  
  afterRender: function(){
    _.defer(this.fadeInCountries);
  },
  
  fadeInCountries: function(){
    var countries = this.$('.point');
    var count = countries.size();
    
    countries.each(function(i, country){      
      setTimeout(
        function(){ 
          $(country).addClass('appear');
        }, 
        Math.sqrt(++i/count) * 1000
      );
    });
  }

});