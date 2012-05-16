var couchapp = require('couchapp')
  , path = require('path');

ddoc = {
    _id: '_design/cgip'
  , views: {}
  , lists: {}
  , shows: {}
  , filters: {}
}

module.exports = ddoc;

ddoc.views.byCollection = {
  map: function(doc) {
    if (doc.collection) {
      emit(doc.collection, doc);
    }
  }
};

ddoc.filters.by_collection = function(doc, req){
  if(doc.collection && req.query &&req.query.collection && doc.collection == req.query.collection)
    return true;
  else if (req.query && req.query.collection && doc._deleted)
    return true;
  else
    return false;
};

couchapp.loadAttachments(ddoc, path.join(__dirname, 'public'));