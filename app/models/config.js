// The config contains global configurations, which can be accessed across the application.

var Model = require('./model');

module.exports = Model.extend({

  defaults : {
    moneyConnectionMode: 'pledgedMode',
    realtime_enabled: true,
    languages: [
      {
        name: 'English',
        code: 'en'
      },
      {
        name: 'Deutsch',
        code: 'de'
      },
      {
        name: 'Francais',
        code: 'fr'
      },
      {
        name: 'Espanol',
        code: 'es'
      },
      {
        name: 'Portuguese',
        code: 'pt'
      },
      {
        name: 'Russian',
        code: 'ru'
      }
    ]
  },

  initialize: function(){
    this.on('change:language', this.languageChanged, this);
  },

  languageChanged: function(){
    if(localStorage){
      localStorage.setItem('language', this.get('language'));
      location.reload();
    }
  },

  enableRealtime: function(){
    this.set('realtime_enabled', true);
  },

  disableRealtime: function(){
    this.set('realtime_enabled', false);
  },

  isRealtimeEnabled: function(){
    return this.get('realtime_enabled') === true;
  }

});