var Boom    = require('boom');                                  // HTTP Errors
var Joi     = require('joi');                                   // Validation
var AnalyticEvent   = require('../models/analyticEvent').AnalyticEvent; // Mongoose ODM

// Exports = exports? Huh? Read: http://stackoverflow.com/a/7142924/5210
module.exports = exports = function (server) {

    console.log('Loading events routes');
    exports.index(server);
    exports.create(server);
    exports.show(server);
    exports.remove(server);
};

/**
 * GET /events
 * Gets all the events from MongoDb and returns them.
 *
 * @param server - The Hapi Server
 */
exports.index = function (server) {
    // GET /events
    server.route({
        method: 'GET',
        path: '/events',
        handler: function (request, reply) {
            AnalyticEvent.find({}, function (err, events) {
                if (!err) {
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
exports.create = function (server) {
    // POST /events
    var event;

    server.route({
        method: 'POST',
        path: '/events',
        handler: function (request, reply) {

            event = new AnalyticEvent();
            event.category = request.payload.category;
            event.action = request.payload.action;
            event.label = request.payload.label;
            event.source = request.info.remoteAddress;

            event.save(function (err) {
                if (!err) {
                    reply(event).created('/events/' + event._id);    // HTTP 201
                } else {
                    reply(Boom.forbidden(getErrorMessageFrom(err))); // HTTP 403
                }
            });
        }
    });
};

/**
 * GET /events/{id}
 * Gets the event based upon the {id} parameter.
 *
 * @param server
 */
exports.show = function (server) {

    server.route({
        method: 'GET',
        path: '/events/{id}',
        config: {
            validate: {
                path: {
                    id: Joi.string().alphanum().min(5).required()
                }
            }
        },
        handler: function (request, reply) {
            AnalyticEvent.findById(request.params.id, function (err, event) {
                if (!err && event) {
                    reply(event);
                } else if (err) {
                    // Log it, but don't show the user, don't want to expose ourselves (think security)
                    console.log(err);
                    reply(Boom.notFound());
                } else {

                    reply(Boom.notFound());
                }
            });
        }
    })
};

/**
 * DELETE /events/{id}
 * Deletes an event, based on the event id in the path.
 *
 * @param server - The Hapi Server
 */
exports.remove = function (server) {
    server.route({
        method: 'DELETE',
        path: '/events/{id}',
        config: {
            validate: {
                path: {
                    id: Joi.string().alphanum().min(5).required()
                }
            }
        },
        handler: function (request, reply) {
            AnalyticEvent.findById(request.params.id, function(err, event) {
                if(!err && event) {
                    event.remove();
                    reply({ message: "Event deleted successfully"});
                } else if(!err) {
                    // Couldn't find the object.
                    reply(Boom.notFound());
                } else {
                    console.log(err);
                    reply(Boom.badRequest("Could not delete Event"));
                }
            });
        }
    })
};

/**
 * Formats an error message that is returned from Mongoose.
 *
 * @param err The error object
 * @returns {string} The error message string.
 */
function getErrorMessageFrom(err) {
    var errorMessage = '';

    if (err.errors) {
        for (var prop in err.errors) {
            if(err.errors.hasOwnProperty(prop)) {
                errorMessage += err.errors[prop].message + ' '
            }
        }

    } else {
        errorMessage = err.message;
    }

    return errorMessage;
}
