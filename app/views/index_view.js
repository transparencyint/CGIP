var View = require('./view');

module.exports = View.extend({
  className: 'index clearfix',

  template: require('./templates/index'),

  getRenderData: function() {
    return {
      countries: this.options.countries.toJSON()
    };
  }

});