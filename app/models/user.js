module.exports = Backbone.Model.extend({
  isLoggedIn: function(){
    return this.has('_id') && this.has('_rev');
  },

  login: function(username, password, options){
    if(!options) options = {};
    if(!options.success) options.success = function(){};
    if(!options.error) options.error = function(){};

    if(this.isLoggedIn())
      options.success();
    else{
      var user = this;
      $.ajax({
        url: '/session',
        type: 'POST',
        data: {username: username, password: password},
        success: function(data){
          user.set(data);
          options.success();
        },
        error: function(error){
          options.error(error);
        }
      });
    }
  },

  logout: function(options){
    if(!options) options = {};
    if(!options.success) options.success = function(){};
    if(!options.error) options.error = function(){};

    if(this.isLoggedIn()){
      var user = this;
      $.ajax({
        url: '/session',
        type: 'DELETE',
        success: function(){
          user.set({ _id: null, _rev: null });
          options.success();
        },
        error: function(){
          options.error();
        }
      });
    }else
      options.success();
  }
});