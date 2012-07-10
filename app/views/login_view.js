var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/login'),

  events: {
    'click #logout-button': 'logoutClicked',
    'keyup #username-input': 'key',
    'keyup #password-input': 'key'
  },

  initialize: function(){
    window.user.on('change', this.render, this);
  },

  logoutClicked: function(){
    window.user.logout();
  },

  key: function(event){
    if(event.keyCode == 13){
      var username = this.$('#username-input').val();
      var password = this.$('#password-input').val();
      window.user.login(username, password, {
        error: function(){
          alert('Wrong username or password!');
        }
      });
    }
  }
});
