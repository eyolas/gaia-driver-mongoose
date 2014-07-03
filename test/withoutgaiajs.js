var should = require('should'),
    request = require('supertest'),
    co = require('co'),
    driver = require('../');

describe('getPersistence', function() {
  describe('connection object', function() {
    it("good connection", function(done) {
      var dbconfig = {
        connection: {
          host: 'localhost',
          database: 'test'
        }
      };
      co(function *() {
        var persistenceDefinition = yield driver.getPersistenceDefinition(dbconfig);
        should(persistenceDefinition).be.ok;
        should(persistenceDefinition).have.property('connection');
        should(persistenceDefinition).have.property('repositories');
        persistenceDefinition.repositories.should.be.empty;
        should(persistenceDefinition).have.property('generatorController');
        should(persistenceDefinition).have.property('native');
      })(done);
    });

    it("bad connection", function(done) {
      var dbconfig = {
        connection: {
          host: 'localhostzez',
          database: 'test'
        }
      };

      co(function *() {
        yield driver.getPersistenceDefinition(dbconfig);
      })(function(err) {
        err.should.throw(Error);
        done();
      })
    });
  });

  describe('connection uri', function() {
    it("good connection", function(done) {
      var dbconfig = {
        connectionUri: "mongodb://localhost/test"
      };
      co(function *() {
        var persistenceDefinition = yield driver.getPersistenceDefinition(dbconfig);
        should(persistenceDefinition).be.ok;
        should(persistenceDefinition).have.property('connection');
        should(persistenceDefinition).have.property('repositories');
        persistenceDefinition.repositories.should.be.empty;
        should(persistenceDefinition).have.property('generatorController');
        should(persistenceDefinition).have.property('native');
      })(done);
    });

    it("bad connection", function(done) {
      var dbconfig = {
        connectionUri: "mongodb://localhostze/test"
      };

      co(function *() {
        yield driver.getPersistenceDefinition(dbconfig);
      })(function(err) {
        err.should.throw(Error);
        done();
      })
    });
  });

  describe('default connection', function() {
    it("good connection", function(done) {
      co(function *() {
        var persistenceDefinition = yield driver.getPersistenceDefinition();
        should(persistenceDefinition).be.ok;
        should(persistenceDefinition).have.property('connection');
        should(persistenceDefinition).have.property('repositories');
        persistenceDefinition.repositories.should.be.empty;
        should(persistenceDefinition).have.property('generatorController');
        should(persistenceDefinition).have.property('native');
      })(done);
    });
  });
});
