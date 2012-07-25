// Application bootstrapper.
Application = {
  initialize: function() {
    var Router = require('lib/router');
    
    // initiate the routers
    this.router = new Router();
    var router = this.router;

    // enable pushState routing for anchors
    // source: https://github.com/chaplinjs/chaplin/blob/0a06ee7a57625cd980011fe316ff78c28f9de88c/src/chaplin/views/layout.coffee#L96
    $(document).on('click', 'a', function(event){
      var el = event.currentTarget;
      var $el = $(el);
      var href = $el.attr('href');
      
      // return if invalid
      if(href == '' || href == undefined || href.charAt(0) == '#') return

      // check for external link
      var currentHostname = location.hostname.replace('.', '\\.');
      var external = (el.hostname != '' && el.hostname != currentHostname);

      // if external do nothing, else: let the router handle it
      if(external)
        return
      else{
        var path = el.pathname + el.search;
        router.navigate(path, {trigger: true});
        event.preventDefault();
      }
    });

    if (typeof Object.freeze === 'function') Object.freeze(this);
  }
}

module.exports = Application;
