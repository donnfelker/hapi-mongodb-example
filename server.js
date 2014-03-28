
var Hapi 		= require('hapi');
var server 	    = new Hapi.Server('localhost', 8000);
var routes 	    = require('./routes');
var Mongoose    = require('mongoose');

// MongoDB Connection
Mongoose.connect('mongodb://localhost/felkerlytics');

var rootHandler = function(request, reply) {
	reply({ message: "Hello from Felkerlytics!"});
};

// Set root route
server.route({
	method: 'GET',
	path: '/',
	handler: rootHandler
});

routes.init(server);

server.start(function () {
    console.log('Server started at: ' + server.info.uri);
});
