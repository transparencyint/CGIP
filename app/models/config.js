var Model = require('./model');

module.exports = Model.extend({

  defaults : {
    moneyConnectionMode: 'disbursedMode'
  },

  initialize: function(){
    this.loadLanguage();
    this.on('change:language', this.languageChanged, this);
  },

  loadLanguage: function(){
    var lang = $.jsperanto.lang();
    if(localStorage){
      lang = localStorage.getItem('language') || lang;
    }
    this.attributes.language = lang;
  },

  languageChanged: function(){
    if(localStorage){
      localStorage.setItem('language', this.get('language'));
      location.reload();
    }
  }

});