var assert = require('assert');
var express = require('express');
var request = require('superagent');

require('../')(request);


describe('superagent-csrf', function () {
  var token;
  var port = 8401;
  var host = 'localhost:' + port;

  var app = express()
    .use(express.cookieParser())
    .use(express.session({ secret: 'secret' }))
    .use(express.csrf())
    .get('/token', function (req, res, next) {
      token = req.csrfToken();
      res.end();
    })
    .post('/', function (req, res, next) {
      res.end();
    });

  var agent = request.agent();

  before(function (done) {
    app.listen(8401, done);
  });

  /**
   * Set up the closured token so the client can use it to request
   */

  before(function (done) {
    agent
      .get(host + '/token')
      .end(function (err, res) {
        assert(!err);
        done();
      });
  });

  it('should succeed against CSRF middleware', function (done) {
    agent
      .post(host + '/')
      .csrf(token)
      .end(function (err, res) {
        assert(res.status === 200);
        done();
      });
  });

  it('should fail when CSRF no token is provided', function (done) {
    agent
      .post(host + '/')
      .end(function (err, res) {
        assert(res.status === 403);
        done();
      });
  });
});