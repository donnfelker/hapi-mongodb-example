var Boom    = require('boom');                  // HTTP Errors
var Joi     = require('joi');                   // Validation
var Event   = require('../models/event').Event; // Mongoose ODM

module.exports = exports = function(server) {

  console.log('Loading events routes');
  exports.index(server);
  exports.new(server);
  exports.show(server);
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

/**
 * POST /new
 * Creates a new event in the datastore.
 *
 * @param server - The Hapi Serve
 */
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
          reply(event).created('/events/' + event._id);    // HTTP 201
        } else {
          ;
          reply(Boom.forbidden(getErrorMessageFrom(err))); // HTTP 403
        }
      });
    }
  });
}

exports.show = function(server) {

    server.route({
        method:     'GET',
        path:       '/events/{id}',
        config: {
            validate: {
                path: {
                    id: Joi.string().alphanum().min(5).required()
                }
            }
        },
        handler:    function (request, reply) {
            Event.findById(request.params.id, function(err, event) {
                if(!err && event) {
                    reply(event);
                } else if(err) {
                    // Log it, but dont show the user, don't want to expose ourselves (think security)
                    console.log(err);
                    reply(Boom.notFound());
                } else {

                    reply(Boom.notFound());
                }
            });
        }
    })
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
