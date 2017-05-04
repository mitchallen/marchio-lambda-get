/**
    Module: marchio-lambda-get
      Test: smoke-test
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint mocha: true */
/*jshint esversion: 6 */

"use strict";

var request = require('supertest'),
    should = require('should'),
    matrix = require('./matrix');

var testMatrix = matrix.create({});

var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

describe('deployment smoke test', () => {

    before( done => {
        done();
    });

    after( done => {
        // Call after all tests
        done();
    });

    beforeEach( done => {
        // Call before each test
        done();
    });

    afterEach( done => {
        // Call after each test
        done();
    });

    ///////////////////////////////////////
    // Test each service in a matrix

    testMatrix.forEach(function (el) {

        var matrixKey = el.key,
            service = el.service,
            table = el.table,
            _testGetHost = el.testGetHost,
            _testGetPath = el.testGetPath,
            _testPostHost = el.testPostHost,
            _testPostPath = el.testPostPath;

        describe(`lambda-dynamo: ${service}`, () => {

            var _testModel = {
                // name: 'beta',
                name: table,
                key: "eid", // Primary key field in DynamoDB
                fields: {
                    email:    { type: String, required: true },
                    status:   { type: String, required: true, default: "NEW" },
                    // In a real world example, password would be hashed by middleware before being saved
                    password: { type: String, select: false },  // select: false, exclude from query results,
                }
            };

            var _postUrl = `${_testPostPath}/${_testModel.name}`;
            // console.log(`POST URL: ${_postUrl}`);

            it('get should succeed', done => {
                var testObject = {
                    email: "test" + getRandomInt( 1000, 1000000) + "@smoketest.cloud",
                    password: "fubar"
                };
                // console.log(`TEST HOST: ${_testPostHost} `);
                // console.log(`TEST URL: ${_testPostHost}${_postUrl} `);
                request(_testPostHost)
                    .post(_postUrl)
                    .send(testObject)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .expect('Content-Type', /json/)
                    .expect('Location', /mldb/ )
                    .end(function (err, res) {
                        should.not.exist(err);
                        // console.log("RESPONSE: ", res.body);
                        res.body.email.should.eql(testObject.email);
                        // Should not return password
                        should.not.exist(res.body.password);
                        res.body.status.should.eql("NEW");
                        should.exist(res.body[_testModel.key]);
                        res.header.location.should.eql(`/${_testModel.name}/${res.body[_testModel.key]}`)
                        should.exist(res.body.eid);
                        var _saveKey = res.body.eid;
                        var _getUrl = `${_testGetPath}/${_testModel.name}/${res.body.eid}`;
                        // console.log("GET URL: ", _getUrl );
                        request(_testGetHost)
                            .get(_getUrl)
                            .expect(200)
                            .expect('Location', `/${_testModel.name}/${res.body.eid}` )
                            .end(function (err, res) {
                                should.not.exist(err);
                                // console.log(res.body);
                                res.body.email.should.eql(testObject.email);
                                // Should not return password
                                should.not.exist(res.body.password);
                                res.body.status.should.eql("NEW");
                                should.exist(res.body.eid);
                                res.body.eid.should.eql(_saveKey);
                                done();
                            });
                    });
            });

            it('get with invalid model id in url should return 404', done => {
                // console.log(`TEST HOST: ${_testPostHost} `);
                var _invalidGetUrl = `${_testGetPath}/${_testModel.name}/bogus`;
                request(_testGetHost)
                    .get(_invalidGetUrl)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function (err, res) {
                        done();
                    });
            });
        });
    });
});