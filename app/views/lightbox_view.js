var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/lightbox'),
  id: 'lightbox',

  events: {
    'click #metadataClose': 'closeMetaData',
    'change .hasOther': 'showInputOther',
    'change input#mitigation': 'showMitigationType',
    'submit .standardForm': 'formSubmit',
    'change input': 'saveData',
    'change select': 'saveData',
    'change textarea': 'saveData',
    'click .delete': 'deleteActor'
  }, 

  initialize: function(){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'handleEscape');

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.updateName();
  },

  updateName: function(){
    var abbrev = this.model.get('abbreviation');
    var name = this.model.get('name');
    if(abbrev !== "")
      this.$('#title').text(abbrev);
    else if(name !== "")
      this.$('#title').text(name);
    else
      this.$('#title').text("New Actor");
  },

  deleteActor: function(){
    if(this.model) 
      this.model.destroy();

    this.destroy();
    return false;
  },

  saveData: function(event){
    $(event.currentTarget).parent().addClass('action-saved');
    this.formSubmit(event);
    setTimeout(function() {
       $(event.currentTarget).parent().removeClass('action-saved');
    }, 2000);
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
    this.$('textarea').autosize({className:'mirroredText'});
  },

  showInputOther: function(event){
    var hiddenBrother;

    if(event.srcElement.type == 'checkbox'){
      if(event.srcElement.name == 'role')
        hiddenBrother = $('input[name=roleOther]'); 
      else if(event.srcElement.name == 'purpose')
        hiddenBrother = $('input[name=purposeOther]'); 

      if(event.target.value === "other" && $(event.target).is(':checked')){
          hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
    } else {
      if(event.target.value === "other"){
          hiddenBrother.removeClass('hidden');
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

    var _abbreviation = $('#abbreviation').val();
    var _fullname = $('#name').val();

    var _organizationType = $('#organizationType').val();
    var _otherType = $('#otherType').val();

    var _role = new Array();
    var _purposeOfProject = new Array(); 

    var _mitigation = $('#typeOfMitigation').val(); 
    var _corruptionRisk = $('#corruptionRisk').val(); 
    var _description = $('#description').val(); 


    $("input[name='role']:checked").each(function() { 
      if($(this).val() == 'other' && $('#roleOther').val() != '')
        _role.push($('#roleOther').val());
      else
        _role.push($(this).val());
    });

    $("input[name='purpose']:checked").each(function() { 
      if($(this).val() == 'other' && $('#purposeOther').val() != '')
        _purposeOfProject.push($('#purposeOther').val());
      else
        _purposeOfProject.push($(this).val());
    });

    if(_purposeOfProject == 'other')
      _purposeOfProject = $('#purposeOther').val();
    else if(_purposeOfProject == 'mitigation')
      _purposeOfProject = $('#purposeOther').val();

    if(_otherType != '' && _organizationType == 'other')
      _organizationType = this.$('#typeOther').val();

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
  },

  getRenderData : function(){
    return this.model.toJSON();
  }

});
