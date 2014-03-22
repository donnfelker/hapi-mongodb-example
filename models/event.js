var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

// The data schema for an event that we're tracking in our analytics engine
var eventSchema = new Schema({
  category      : { type: String, required: true, trim: true },
  action        : { type: String, required: true, trim: true },
  label         : { type: String, trim: true },
  source        : { type: String, required: true,trim: true,  },       // Usually the IP address
  dateCreated   : { type: Date,   required: true, default: Date.now }
});

var event = Mongoose.model('event', eventSchema);

module.exports = {
  Event: event
};
