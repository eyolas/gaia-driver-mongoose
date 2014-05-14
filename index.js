'use strict';

var mongoose = require('mongoose'),
	Q = require('q'),
	path = require('path'),
	thunkify = require('thunkify'),
	glob = thunkify(require("glob")),
	S = require('string');


var databaseHandler = {};
var cacheDatabaseSchema = {};
var cacheConnection = {};
var wasInitialize = false;

/**
 * connection to mongodb
 */
function connect(dbConfig) {
	var deferred = Q.defer();
	var connection = mongoose.createConnection(makeConnectionString(dbConfig));
	connection.on('connected', function (){
		deferred.resolve(connection);
	});
	connection.on('error', function(error) {
		deferred.reject(new Error(error));
	})
	return deferred.promise;
}

function *createConnections(dbConfig) {
	for (var name in dbConfig.connections) {
		var connectionConfig = dbConfig.connections[name];
		if ("mongoose" !== connectionConfig.driver) continue;
		cacheConnection[name] = yield connect(dbConfig.connections[name]);
	}

	if (Object.keys(cacheConnection).length === 0) {
		Log.warn("no connection with mongoose driver. Delete gaia-driver-mongoose dependencie");
	}
}



/**
 * Inject databse middleware
 */
exports.injectDatabase = function() {
	return function *(next) {
		this.getDatabaseHandler = getDatabaseHandler;
		yield next;
	}
}

exports.mongoose = mongoose;

/**
 * Initialize database
 */
exports.init = function *(gaia) {
	var dbConfig = gaia.config.database;
	if (wasInitialize) return;
	yield createConnections(dbConfig);

	for (var databaseSchemaName in dbConfig.databaseSchema) {
		var databaseSchema = dbConfig.databaseSchema[databaseSchemaName];

		cacheDatabaseSchema[databaseSchemaName] = {
			models: yield getModels(gaia.config.appDir, databaseSchema.dir),
			connection: cacheConnection[databaseSchema.connection]
		};

		var handler = databaseHandler[databaseSchema.databaseName] = createDatabaseHandler(databaseSchema.databaseName, cacheDatabaseSchema[databaseSchemaName]);
		if (databaseSchema.default) {
			databaseHandler["default"] = handler;
		}

		if (databaseSchema.collectionTestForFirstRun && databaseSchema.onFirstRun) {
			var obj = handler[databaseSchema.collectionTestForFirstRun];
			var objs = yield obj.find().exec();
			if (!objs || !objs.length) yield databaseSchema.onFirstRun(handler);
		}
	}
	wasInitialize = true;
}

/**
 * Return the database handler
 *
 */
var getDatabaseHandler = exports.getDatabaseHandler = function (databaseName, schemaName) {
	if (!databaseName) databaseName = "default";

	if (databaseHandler[databaseName]) {
		return databaseHandler[databaseName];
	}

	if (schemaName && cacheDatabaseSchema[schemaName]) {
		return databaseHandler[databaseName] = createDatabaseHandler(databaseName, cacheDatabaseSchema[schemaName]);
	}
	return null;
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
		buff.push(dbConfig.databse);
	}

	return buff.join('');
}


/**
 * Create a database handler with specific shema
 */
function createDatabaseHandler(databaseName, schema) {
	var databaseHandler = {};
	var handler = schema.connection.useDb(databaseName);
	var models = schema.models;
	models.forEach(function(model) {
		databaseHandler[model.name] = handler.model(model.name, model.schema);
	});

	return databaseHandler;
}

/**
 * Get all models
 */
function *getModels(appDir, modelsDir) {
	var modelsPath = path.resolve(appDir, 'app/models', modelsDir) + '/**/*.js';

	var files = yield glob(modelsPath, {});
	var models = [];
	files.forEach(function (file) {
		if (~file.indexOf('.js')) {
			models.push({
				name: S(path.basename(file, '.js')).capitalize().camelize().s,
				schema: require(path.resolve(appDir, 'app/models', modelsDir, file))
			});
		}
	});
	return models;
}
