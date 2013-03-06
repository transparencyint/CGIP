var Settings = require('../settings_view');

module.exports = Settings.extend({
  template: require('../templates/presentation/presentation_settings'),
  
  getRenderData: function(){
    return { 
      editLink: '/edit/' + this.editor.country.get('abbreviation'),
      active: config.get('language'),
      languages: this.getLanguages()
    };
  },
  
  renderFlag: function(data, container){
    var flagUri = data.id;
    
    if(flagUri === 'en')
      flagUri = navigator.language.match(/gb/i) ? 'gb' : 'us';
      
    var flag = '<img class="flag" src="../images/flags/'+ flagUri +'.svg" alt="'+ data.text +'" title="'+ data.text +'">';
    container.html(flag);
  },
  
  afterRender: function(){    
    this.$('#language').select2({
      formatResult: this.renderFlag,
      formatSelection: this.renderFlag
    });
  }
});