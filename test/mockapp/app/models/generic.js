'use strict';


module.exports = function $inject($persistence) {
  var mongoose = $persistence.native,
      Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  /**
   * generic Schema
   */
  var GenericSchema = new Schema({
    name: { type: String}
  });

  return GenericSchema;
};
