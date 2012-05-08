var View = require('./view');
var Import = require('models/import');

module.exports = View.extend({
  
  template: require('./templates/import_table_row'),
  
  className : '',
  tagName : 'tr',
  
  initialize: function(){
  },
  
  getRenderData : function(){
    return this.model;
  },
  
  afterRender: function(){
  },
});

var inputDown, inputMove, inputUp;

if (window.Touch) {
  inputDown = "touchstart";
  inputMove = "touchmove";
  inputUp = "touchend";
}
else {
  inputDown = "mousedown";
  inputMove = "mousemove";
  inputUp = "mouseup";
}

$(document).bind(inputUp, function(){ $(this).unbind(inputMove); });

function normalizedX(event){
  return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
} 

function normalizedY(event){
  return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
}