var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_edit_index'),

  getRenderData: function(){
    return { country: this.options.country };
  }
});