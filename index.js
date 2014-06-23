/********************************
 ** Module dependencies
 ********************************/
var mongoose = require('mongoose'),
  Q = require('q'),
  path = require('path');

/**
 * connection to mongodb
 */
function connect(dbConfig, options) {
  var deferred = Q.defer(),
      connection = mongoose.createConnection(makeConnectionString(dbConfig.connection), dbConfig.options);

  if (dbConfig.hasOwnProperty('debug') && dbConfig.debug) {
    mongoose.set('debug', true);
  }
  
  connection.on('connected', function (){
    deferred.resolve(connection);
  });

  connection.on('error', function(error) {
    deferred.reject(new Error(error));
  });

  return deferred.promise;
}

exports.native = mongoose;

/**
 * Initialize database
 */
exports.getPersistenceDefinition = function *(dbConfig, models) {
  var connection = yield connect(dbConfig);
  var repositories = {};
  models.forEach(function(model) {
    repositories[model.name] = connection.model(pascalCase(model.name), model.schema);
  });

  return {
    connection: connection,
    repositories: repositories,
    generatorController: require('./generatorController'),
    native: mongoose
  }
};

function pascalCase(string) {
  return string.substr(0,1).toUpperCase() + string.substring(1);
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