var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),
  id: 'lightbox',

  events: {
    'click #metadataClose': 'closeMetaData',
    'change .hasOther': 'showInputOther',
    'change input#mitigation': 'showMitigationType',
    'submit .standardForm': 'formSubmit'
  }, 

  initialize: function(){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'handleEscape');
  },

  closeMetaData: function(){ 
    this.destroy();
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    $(document).unbind('keydown', this.handleEscape);
  },

  handleEscape: function(event){
    if (event.keyCode === 27) {
      this.closeMetaData();
    }
  },

  afterRender: function() {
    $(document).keydown(this.handleEscape);
    this.$('textarea').autosize();
  },

  showInputOther: function(event){
    var hiddenBrother = $(event.target.nextElementSibling);

    if(event.srcElement.type == 'checkbox'){
      console.log(event.srcElement.name);
      if(event.srcElement.name == 'role')
        hiddenBrother = $('input[name=roleOther]'); 
      else if(event.srcElement.name == 'purpose')
        hiddenBrother = $('input[name=purposeOther]'); 

      if(event.target.value === "other" && $(event.target).is(':checked')){
          hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
    }
    else {
      if(event.target.value === "other"){
          hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
    }

  },

  showMitigationType: function(event){
    if($(event.target).is(':checked'))
      $('#mitigationType').removeClass('hidden');
    else if(!$('#mitigationType').hasClass('hidden'))
      $('#mitigationType').addClass('hidden');
  },

  /**
    Gather all the data given by the user through inputs and save the addional Information to the actor model
  */
  formSubmit: function(event){

    //avoids taking Browser to a new URL
    event.preventDefault();

    var _abbreviation = $("input[name='abbreviation']").val();

    var _fullname = $("input[name='name']").val();

    var _organizationType = $("select[name='organizationType']").val();
    var _otherType = $("input[name='otherType']").val();

    var _role = new Array();
    var _purposeOfProject = new Array(); 

    var _mitigation = $("select[name='typeOfMitigation']").val(); 
    var _corruptionRisk = $("textarea[name='corruptionRisk']").val(); 
    var _description = $("textarea[name='description']").val(); 

    $("input[name='role']:checked").each(function() { 
      if($(this).val() == 'other' && $('input[name=roleOther]').val() != '')
        _role.push($('input[name=roleOther]').val());
      else
        _role.push($(this).val());
    });

    $("input[name='purpose']:checked").each(function() { 
      if($(this).val() == 'other' && $('input[name=purposeOther]').val() != '')
        _purposeOfProject.push($('input[name=purposeOther]').val());
      else
        _purposeOfProject.push($(this).val());
    });

    if(_purposeOfProject == 'other')
      _purposeOfProject = $('input[name=purposeOther]').val();
    else if(_purposeOfProject == 'mitigation')
      _purposeOfProject = $('input[name=purposeOther]').val();

    if(_otherType != '' && _organizationType == 'other')
      _organizationType = event.srcElement[1].value;

    this.model.save({
      abbreviation : _abbreviation,
      name : _fullname,
      organizationType : _organizationType,
      role : _role,
      purposeOfProject : _purposeOfProject,
      mitigation : _mitigation,
      corruptionRisk : _corruptionRisk,
      description : _description
    });

    $('#output').html('Data successfully saved');

    //Close the lightbox
    $('#lightbox').delay(800).hide(150);
  },

  show: function(event){

    $('#lightbox').show();
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

});
