var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),

  events: {
    'click #metadataClose': 'closeMetaData',
    'change .hasOther': 'showInput',
    'submit .standardForm': 'formSubmit'
  },

  initialize: function(){ 

  },  

  closeMetaData: function(){ 
    $('#lightbox').hide();
  },

  showInput: function(event){
    var hiddenBrother = $(event.target.nextElementSibling);

    if(event.srcElement.type == 'checkbox'){
      hiddenBrother = $('input[name=roleOther]'); 

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

  formSubmit: function(event){
    event.preventDefault();

    var _type = $("select[name='type']").val();
    var _otherType = $("input[name='otherType']").val();

    var _role = new Array();

    $("input[name='role']:checked").each(function() { 
      if($(this).val() == 'other' && $('input[name=roleOther]').val() != '')
        _role.push($('input[name=roleOther]').val());
      else
        _role.push($(this).val());
    });

    var _purposeOfProject = $("select[name='purposeOfProject']").val(); 

    if(_purposeOfProject == 'other')
    {
      _purposeOfProject = $('input[name=purposeOther]').val();
    }

    var _mitigation = $("select[name='mitigation']").val(); 
    var _corruptionRisk = $("textarea[name='corruptionRisk']").val(); 
    var _description = $("textarea[name='description']").val(); 

    if(_otherType != '' && _type == 'other')
    {
      _type = event.srcElement[1].value;
    }

    console.log(_type);
    console.log(_role);
    console.log(_purposeOfProject);
    console.log(_mitigation);
    console.log(_corruptionRisk);
    console.log(_description);

    this.model.save({
      type : _type,
      role : _role,
      purposeOfProject : _purposeOfProject,
      mitigation : _mitigation,
      corruptionRisk : _corruptionRisk,
      description : _description
    });
  },

  show: function(event){
    $('#lightbox').show();
    console.log(this.model);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){

  }

});
