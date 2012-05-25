var Connection = require('./connection');

module.exports = Connection.extend({

  defaults: function(){
    // add the money connectiontype to the defaults
    var data = Connection.prototype.defaults.call(this);
    data.connectionType = 'money';
    data.pledged = 0;
    data.dispursed = 0;
    return data;
  }

});