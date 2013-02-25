var Settings = require('../settings_view');

module.exports = Settings.extend({
  template: require('../templates/presentation/presentation_settings'),
  className: 'presentationLanguage',
  
  events: function() {
    var _events = {
      'click': 'stopPropagation',
      'change #language': 'changeLanguage'
    };

    // bind dynamic input event (touch or mouse)
    _events[ this.inputDownEvent] = 'stopPropagation';

    return _events;
  },
  
  initialize: function(options){    
    this.editor = options.editor;
  },
  
  getRenderData: function(){
    var languages = [
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
      }
    ];
    
    return { 
      presentationLink: '/edit/' + this.editor.country.get('abbreviation'),
      languages: languages,
      active: config.get('language'),
    };
  }
});