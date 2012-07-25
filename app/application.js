// Application bootstrapper.
Application = {
  initialize: function() {
    var Router = require('lib/router');
    var LoginView = require('views/login_view');
    
    // initiate the routers
    this.router = new Router();
    
    // hijack link clicks
    this.hijackLinks(this.router);

    // render login view
    var lv = new LoginView({
      el: $('#user')
    });
    lv.render();

    if (typeof Object.freeze === 'function') Object.freeze(this);
  },

  hijackLinks: function(router){
    // enable pushState routing for anchors
    // source: https://github.com/chaplinjs/chaplin/blob/0a06ee7a57625cd980011fe316ff78c28f9de88c/src/chaplin/views/layout.coffee#L96
    $(document).on('click', 'a', function(event){
      var el = event.currentTarget;
      var $el = $(el);
      var href = $el.attr('href');
      
      // return if invalid
      if(href == '' || href == undefined || href.charAt(0) == '#') return

      // check for external link
      var external = (el.hostname != '' && el.hostname != location.hostname);

      // if external do nothing, else: let the router handle it
      if(external)
        return
      else{
        var path = el.pathname + el.search;
        router.navigate(path, {trigger: true});
        event.preventDefault();
      }
    });
  }
}

module.exports = Application;
