var Settings = require('../settings_view');

module.exports = Settings.extend({
  template: require('../templates/presentation/presentation_settings'),
  
  getRenderData: function(){
    return { 
      editLink: '/edit/' + this.editor.country.get('abbreviation')
    };
  }
});