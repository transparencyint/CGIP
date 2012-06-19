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
      if(event.target.value === "other" ){
        hiddenBrother.removeClass('hidden');
      } else {
        hiddenBrother.addClass('hidden').val("");
      }
  },

  formSubmit: function(event){
    event.preventDefault();
    console.log(event);

    console.log(event.srcElement[0].value);
    console.log(event.srcElement[0].value);
    /* Parse the form */
    //console.log(request);

    //var type = event.
    /*this.model.save({
      type : event.,
      role : '',
      purpose : '',
      mitigation : '',
      corruptionRisk : '',
      description : ''
    });
*/

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
