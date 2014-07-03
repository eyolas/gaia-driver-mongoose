/********************************
 ** Module dependencies
 ********************************/
var mongoose = require('mongoose')
  path = require('path');

/**
 * connection to mongodb
 */
function connect(dbConfig, options) {
  return function(cb) {
    var uri = dbConfig.connectionUri || makeConnectionString(dbConfig.connection);
    var connection = mongoose.createConnection(uri, dbConfig.options);

    if (dbConfig.hasOwnProperty('debug') && dbConfig.debug) {
      mongoose.set('debug', true);
    }

    connection.on('connected', function (){
      cb(null, connection);
    });

    connection.on('error', function(error) {
      cb(error);
    });
  }
}

exports.native = mongoose;

/**
 * Initialize database
 */
exports.getPersistenceDefinition = function *(config, models) {
  var dbConfig = getConfig(config);
  var connection = yield connect(dbConfig);
  var repositories = {};
  if (models && Array.isArray(models)) {
    models.forEach(function(model) {
      repositories[model.name] = connection.model(pascalCase(model.name), model.schema);
    });
  }

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


function getConfig(config) {
  if (!config) config = {};
  if ((!config.connectionUri && !config.connection)
      || (!config.connectionUri && config.connection && (!config.connection.database || !config.connection.host))) {
        config.connectionUri = "mongodb://localhost/test";
  }
  return config;
}


/**
 * Generate connection string
 */
function makeConnectionString(dbConfig) {
  var buff = [ 'mongodb://' ];
  if (dbConfig.user) {
    buff.push(dbConfig.user, ':', dbConfig.password, '@');
  }
  buff.push(dbConfig.host, '/');

  if (dbConfig.database){
    buff.push(dbConfig.database);
  }

  return buff.join('');
}
