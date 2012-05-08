var View = require('./view');
var Import = require('models/import');
var ImportTableView = require('views/import_table_view');


module.exports = View.extend({
  
  template: require('./templates/import'),
  
  className : 'import',
  
  events : {
    "change #importfile" : "uploadFile"
  },
  
  initialize: function(){
    this.model = new Import();
  },
  
  uploadFile: function(data) {
    var files = data.target.files;

    var importView = this;

    for (var i = 0, f; f = files[i]; i++) {
      console.log(f.fileName);

      var reader = new FileReader();

      reader.onload = (function(f){
        return function(e) {
          var filecontent = e.target.result;

          var importTableView = new ImportTableView({model: $.csv2Array(filecontent)});
          importTableView.render();

          importView.$el.append(importTableView.el);
        }
      })(f);

      reader.readAsText(f);
    }
  },

  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    this.model.forEach(function(model){
      var name = model.get('name');
    });
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