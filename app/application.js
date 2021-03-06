var Countries = require('models/countries');
var Router = require('lib/router');
var NavigationView = require('views/navigation_view');

// Application bootstrapper.
Application = {
  initialize: function(done) {
    var app = this;

    // initiate the router
    this.router = new Router();
    this.router.app = this;
    
    // hijack link clicks
    this.hijackLinks(this.router);

    // singleton for country-list
    this.countries = new Countries();

    // render navigation view
    this.nav = new NavigationView({ router: this.router, countries: this.countries });

    // read out the language on load
    var lang = false;
    if(localStorage) lang = localStorage.getItem('language');

    var i18nOptions = {
      lang: lang || false,
      fallbackLang: 'en',
      dicoPath: '/locales'
    };

    // fetch the countries, load the dictionary and start the app
    $.when(this.countries.fetch(), $.jsperanto.init(i18nOptions)).done(function(){
      // setting the language in a dirty way (don't try this at home and only if you know what you're doing)
      config.attributes.language = $.jsperanto.lang();
      // render the navigation
      app.nav.render();
      $('#container').append(app.nav.el);
      // we're finished, start the application
      done();
    });
  },

  hijackLinks: function(router){
    // enable pushState routing for anchors
    // source: https://github.com/chaplinjs/chaplin/blob/0a06ee7a57625cd980011fe316ff78c28f9de88c/src/chaplin/views/layout.coffee#L96
    $(document).on('click', 'a[href]', function(event){
      var el = event.currentTarget;
      var $el = $(el);
      var href = $el.attr('href');
      
      // return if invalid
      if(href == '' || href == undefined || href.charAt(0) == '#' || href == 'javascript:void(0)') return

      // check for external link
      var external = (el.hostname != '' && el.hostname != location.hostname) || ($el.attr('external') != undefined);

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
