var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/login'),

  events: {
    'click #logout-button': 'logoutClicked',
    'submit form': 'login'
  },
  
  className: 'controls top right',

  initialize: function(){
    window.user.on('change', this.render, this);
  },

  logoutClicked: function(){
    window.user.logout();
  },

  login: function(event){
    event.preventDefault();
    var usernameElement = this.$('#username-input');
    
    var username = usernameElement.val();
    var password = this.$('#password-input').val();
    
    window.user.login(username, password, {
      error: function(){
        alert('Wrong username or password!');
        usernameElement.focus();
      }
    });
  }
});
