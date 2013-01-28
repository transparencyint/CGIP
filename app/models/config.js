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
    if(localStorage){
      var lang = localStorage.getItem('language');
      if(lang) this.set('language', lang, {silent: true});
    }
  },

  languageChanged: function(){
    if(localStorage){
      localStorage.setItem('language', this.get('language'));
      location.reload();
    }
  }

});