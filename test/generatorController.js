var should = require('should'),
    request = require('supertest'),
    co = require('co'),
    mockapp = require('./mockapp'),
    driver = require('../');




describe("generator", function() {
  it("get /generic", function(done) {
    this.timeout(0);
    var mock = mockapp();
    mock.then(function(mock) {
      console.log("genenenen")
      var server = require('http').Server(mock.app.callback());
      request(server.listen())
        .get('/generic')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err){
          if (err) return done(err);
          done();
        });
    });
  });

  it("get /generic/create", function(done) {
    this.timeout(0);
    var mock = mockapp();
    mock.then(function(mock) {
      var server = require('http').Server(mock.app.callback());
      request(server.listen())
        .get('/generic/create?name=toto')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err){
          if (err) return done(err);
          done();
        });
    });
  });
});