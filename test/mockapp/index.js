var gaiajs = require('gaiajs'),
    Q = require('q'),
    co = require('co');

module.exports = function(hooks) {
    hooks = hooks || {};
    var options = {
        hooks: hooks,
        appDir: __dirname
    }
    var deferred = Q.defer();
    new gaiajs(options).start(function(err, server) {
        if (err) throw new Error(err);
        return deferred.resolve(server);
    });
    return deferred.promise;
}
