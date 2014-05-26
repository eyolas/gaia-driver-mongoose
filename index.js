'use strict';

var mongoose = require('mongoose'),
	Q = require('q'),
	path = require('path');

/**
 * connection to mongodb
 */
function connect(dbConfig) {
	var deferred = Q.defer(),
			connection = mongoose.createConnection(makeConnectionString(dbConfig));

	connection.on('connected', function (){
		deferred.resolve(connection);
	});

	connection.on('error', function(error) {
		deferred.reject(new Error(error));
	});

	return deferred.promise;
}

exports.native = {name: "mongoose", api: mongoose};

/**
 * Initialize database
 */
exports.getHandler = function *(dbConfig, models) {
	var connection = yield connect(dbConfig);
	var handlers = {};
	models.forEach(function(model) {
		handlers[model.name] = connection.model(model.name, model.schema);
	});

	return {
		connection: connection,
		handlers: handlers,
		native: mongoose
	}
}


/**
 * Generate connection string
 */
function makeConnectionString(dbConfig) {
	var buff = [ 'mongodb://' ];
	if (dbConfig.user) {
		buff.push(dbConfig.user, ':', dbConfig.password, '@');
	}
	buff.push(dbConfig.server, '/');

	if (dbConfig.database){
		buff.push(dbConfig.database);
	}

	return buff.join('');
}
