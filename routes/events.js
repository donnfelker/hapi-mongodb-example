var Boom    = require('boom');
var Event   = require('../models/event').Event;

module.exports = exports = function(server) {

  console.log('Loading events routes');
  exports.index(server);
  exports.new(server);
}

exports.index = function(server) {
    // GET /events
    server.route({
      method:   'GET',
      path:     '/events',
      handler:  function(request, reply) {
        Event.find({}, function(err, events) {
          if(!err) {
            reply(events);
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        });
      }
    });
};

exports.new = function(server) {
  // POST /events
  var event;

  server.route({
    method:    'POST',
    path:      '/events',
    handler:   function(request, reply) {

      event = new Event();
      event.category = request.payload.category;
      event.action   = request.payload.action;
      event.label    = request.payload.label;
      event.source   = request.info.remoteAddress;

      event.save(function(err) {
        if(!err) {
          reply(event).created('/events/' + event._id);
        } else {
          ;
          reply(Boom.forbidden(getErrorMessageFrom(err)));
        }
      });
    }
  });
}

function getErrorMessageFrom(err) {
  var errorMessage = '';
  var i;

  if(err.errors) {
    for(var prop in err.errors) {
      errorMessage += err.errors[prop].message + ' '
    }

  } else {
    errorMessage = err.message;
  }

  return errorMessage;
}
