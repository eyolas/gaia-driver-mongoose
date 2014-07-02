var should = require('should'),
    request = require('supertest'),
    co = require('co'),
    mockapp = require('./mockapp'),
    driver = require('../');

function makeHook(done) {
  var hooks = {};
  hooks.afterDatabase = function $inject($injector) {
    return function *() {
      should($injector.dependencies).be.ok;
      should($injector.dependencies).have.property('$defaultPersistence');
      should($injector.dependencies).have.property('$persistence');
      should($injector.dependencies).have.property('$genericRepository');
      should($injector.dependencies.$genericRepository).have.property('modelName', 'Generic');
      done();
    }
  };
  return hooks;
}


describe("injector", function() {
  it("t", function(done) {
    this.timeout(0);
    makeHook(done);
    var mock = mockapp(makeHook(done));
  })
});