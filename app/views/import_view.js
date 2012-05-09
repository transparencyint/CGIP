var View = require('./view');
var Import = require('models/import');
var ImportTableView = require('./import_table_view');

module.exports = View.extend({
  
  template: require('./templates/import'),
  
  className : 'import',
  
  events : {
    "change #importfile" : "preProcessFile"
  },
  
  initialize: function(){
    this.model = new Import();
  },
  
  preProcessFile: function(event){
    var files = data.target.files;
    this.processFile(files[0]);
  },

  /**
  Reads in the CSV File, parses it and creates an ImportTableView
  **/
  processFile: function(f) {
    var importView = this;
    var reader = new FileReader();

    reader.onload = (function(f){
      return function(e) {
        var filecontent = e.target.result;
        var model = $.csv2Array(filecontent);

        var importTableView = new ImportTableView({model: model});
        importTableView.render();

        importView.$el.append(importTableView.el);
      }
    })(f);

    reader.readAsText(f);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    // Give visual Feedback on drag event
    this.$('#csv-upload-target').on('dragstart', function(event){event.preventDefault();});

    this.$('#csv-upload-target').on('dragover', function(event){
      event.preventDefault();
      $(event.target).addClass('active-file');
    });

    this.$('#csv-upload-target').on('dragleave', function(event){
      event.preventDefault();
      $(event.target).removeClass('active-file');
    });

    // process file on drop event
    var importView = this;
    this.$('#csv-upload-target').on('drop', function(event){
      event.stopPropagation();
      event.preventDefault();
      
      var files = event.originalEvent.dataTransfer.files;
      importView.processFile(files[0])

      return false;
    });
  }
});