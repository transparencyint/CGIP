ddoc = {
    _id: '_design/cgip'
  , views: {}
  , lists: {}
  , shows: {}
  , filters: {}
};

ddoc.views.connectionsByTypeAndCountry = {
  map: "function(doc) {\
    if (doc.type && doc.type === 'connection' && doc.connectionType) {\
      emit([doc.country, doc.connectionType], doc);\
    }\
  }"
};

ddoc.views.actorsByCountry = {
  map: "function(doc) {\
    if (doc.type && doc.type === 'actor') {\
      emit(doc.country, doc);\
    }\
  }"
};

exports.design_doc = ddoc;