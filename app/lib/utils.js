module.exports = {
  
  /** Returns null for 'none' values */
  sanitizeConnectionVal: function(value){
    return (value == 'none') ? null : value;
  }
};