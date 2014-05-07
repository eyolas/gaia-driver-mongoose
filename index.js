'use strict';

var mongoose = require('mongoose'),
	Q = require('q'),
	path = require('path'),
	thunkify = require('thunkify'),
	glob = thunkify(require("glob")),
	S = require('string');


var databaseHandler = {};
var cacheDatabaseSchema = {};
var wasInitialize = false;
var db;

/**
 * connection to mongodb
 */
function connect(dbConfig) {
	var deferred = Q.defer();
	db = mongoose.createConnection(makeConnectionString(dbConfig));
	db.on('connected', function (){
		deferred.resolve();
	});
	db.on('error', function(error) {
		deferred.reject(new Error(error));
	})
	return deferred.promise;
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

/**
 * Initialize database
 */
exports.init = function *(gaia) {
	var dbConfig = gaia.config.database;
	if (wasInitialize) return;
	yield connect(dbConfig);

	for (var databaseSchemaName in dbConfig.databaseSchema) {
		var databaseSchema = dbConfig.databaseSchema[databaseSchemaName];

		cacheDatabaseSchema[databaseSchemaName] = yield getModels(gaia.config.appDir, databaseSchema.dir);
		var handler = databaseHandler[databaseSchema.databaseName] = createDatabaseHandler(databaseSchema.databaseName, cacheDatabaseSchema[databaseSchemaName]);
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
	if (databaseHandler[databaseName]) {
		return databaseHandler[databaseName];
	}

	if (schemaName && cacheDatabaseSchema[schemaName]) {
		return databaseHandler[databaseName] = createDatabaseHandler(databaseName, schemaName);
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
	buff.push(dbConfig.server, '/', dbConfig.database);

	return buff.join('');
}


/**
 * Create a database handler with specific shema
 */
function createDatabaseHandler(databaseName, schema) {
	var databaseHandler = {};
	var handler = db.useDb(databaseName);
	var models = schema;
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