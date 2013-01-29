var View = require('./view');
var clickCatcher = require('./click_catcher_view');
var RoleBackgroundView = require('./role_background_view');

module.exports = View.extend({
  template: require('./templates/settings'),
  className: 'settings',
  
  events: {
    'click': 'stopPropagation',
    
    // the show/hide button
    'click .button': 'toggle',
    
    'change #showMonitoring': 'toggleMonitoring',
    'change #language': 'changeLanguage'
  },
  
  initialize: function(options){    
    this.isOpen = false;
    this.editor = options.editor;
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  toggle: function(){
    if(this.isOpen)
      this.close();
    else
      this.open();
  },
  
  open: function(){
    this.$el.addClass('active');
    this.$('.cog').addClass('active');
    
    new clickCatcher({ callback: this.close.bind(this), holder: this.editor.$el, zIndex: 5 });
    
    this.isOpen = true;
  },
  
  close: function(){
    this.$el.removeClass('active');
    this.$('.cog').removeClass('active');
    
    this.isOpen = false;
  },
  
  toggleMonitoring: function(){
    this.editor.rbw.toggleMonitoring();
  },
  
  changeLanguage: function(event){
    config.set({language: this.$('#language').val()});
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
      }
    ];
    
    return { 
      languages: languages,
      active: config.get('language'),
      showMonitoring: this.editor.country.get('showMonitoring')
    };
  }
});