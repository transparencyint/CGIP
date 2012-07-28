var View = require('views/view');
var ImportTableView = require('./import_table_view');
var ImportHeadlineView = require('./import_headline_view');

module.exports = View.extend({
  
  template: require('views/templates/csv_import/import'),
  
  className : 'importView',
  
  events : {
    "change #importfile" : "preProcessFile"
  },
  
  preProcessFile: function(event){
    var files = event.target.files;
    //Only one file is in the filelist
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
        var csvdata = $.csv2Array(filecontent);

        var importHeadlineView = new ImportHeadlineView({country: importView.options.country, model: csvdata});
        importHeadlineView.render();
        importView.$el.empty().append(importHeadlineView.el);
        
        var importTableView = new ImportTableView({model: csvdata});
        importTableView.render();
        importView.$el.append(importTableView.el);
      }
    })(f);

    reader.readAsText(f);
  },
  

  /**
  Add Drag and Drop capability to import a file
  **/
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