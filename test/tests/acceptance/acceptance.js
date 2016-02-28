'use strict';

var http = require('http');

var chai = require('chai'),
    expect = chai.expect;

var createServer = require('../../doubles/server').createServer;

var rester = require('../../../src');

describe('Acceptance', function () {

    var port = 8761,
        server;

    before(function () {
        server = createServer(port);
    });

    after(function () {
        server.close();
    });

    context('When making a GET request', function () {
        var transaction;
        beforeEach(function (done) {
            var client = new rester.Client({});
            transaction = client.request('GET http://localhost:' + port + '/hello');
            transaction.on('end', function () {
                done();
            });
            transaction.send();
        });
        describe('Provides request', function () {
            it('With request line', function () {
                expect(transaction.getRequest()).to.contain('GET /hello HTTP/1.1');
            });
            it('With host header', function () {
                expect(transaction.getRequest()).to.contain('Host: localhost:' + port);
            });
        });
        describe('Provides response', function () {
            it('With status code line', function () {
                expect(transaction.getResponse()).to.match(/^HTTP\/1\.1 200 OK/);
            });
            it('With headers', function () {
                expect(transaction.getResponse()).to.match(/Content-type: text\/plain/i);
            });
            it('With response body', function () {
                expect(transaction.getResponse()).to.match(/Hello, world!$/);
            });
        });
    });

    it('When sending request with body', function () {
        var body = 'Message payload';
        var transaction;
        beforeEach(function (done) {
            var client = new rester.Client({});
            var request = 'POST http://localhost:' + port + '/echo' + '\r\n' +
                'Content-type: text/plain\r\n' +
                '\r\n' +
                body;
            transaction = client.request(request);
            transaction.on('end', function () {
                done();
            });
            transaction.send();
        });
        it('Submits request body to server', function () {
            expect(transaction.getResponse()).to.contain(body);
        });
    });
});