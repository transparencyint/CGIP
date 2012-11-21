module.exports = {
  hasBeenMigrated: function(model, migrationID){
    if(!model.migrations){ model.migrations = {}; }
    // only execute this migration if not already processed
    if(!model.migrations[migrationID]){
      model.migrations[migrationID] = true;
      return false;
    }else{
      return true;
    }
  }
};