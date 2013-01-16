var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/login'),

  events: {
    'click #logout-button': 'logoutClicked',
    'submit form': 'login'
  },
  
  className: 'login center',

  initialize: function(){
    _.bindAll(this, 'redirectToGoal');
  },

  logoutClicked: function(){
    window.user.logout();
  },
  
  afterRender: function(){
    var self = this;
    _.defer(function(){
      self.$('input').first().focus();
    });
  },

  login: function(event){
    event.preventDefault();
    var usernameElement = this.$('#username-input');
    
    var username = usernameElement.val();
    var password = this.$('#password-input').val();
    
    window.user.login(username, password, {
      success: this.redirectToGoal,
      error: function(){
        alert('Wrong username or password!');
        usernameElement.focus();
      }
    });
  },

  redirectToGoal: function(){
    // hard reload to the forward url
    location.href = this.options.forward;
  }
});
