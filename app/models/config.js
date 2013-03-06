// The config contains global configurations, which can be accessed across the application.

var Model = require('./model');

module.exports = Model.extend({

  defaults : {
    moneyConnectionMode: 'disbursedMode',
    realtime_enabled: true
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