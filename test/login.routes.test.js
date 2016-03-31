'use strict';
const chai = require('chai');

const expect = chai.expect;
const chai_http = require('chai-http');
const server = require('../index');
const app = server.app;
const pg = require('../database/pg_connect');

chai.use(chai_http);
chai.should();

let user = [
    'testAdmin',
    'testPassword',
    'test@test.com',
    true
];

describe('Test', function() {
    before(function(done) {
        console.log('before');
        pg.connect(function(err, client, db_done) {
            if (err) console.log(err);
            client.query('INSERT INTO logins (user_name, password, email, validated) VALUES ($1, $2, $3, $4)', user, function(query_error, query_result) {
                db_done();
                if (query_error) return done(query_error);
                done();
            })
        });
    });

    after(function(done) {
        console.log('after');
        pg.connect(function(err, client, db_done) {
            client.query('DELETE from logins where user_name = $1', ['testAdmin'], function(query_error, query_result) {
                db_done();
                if (query_error) return done(query_error);
                done();
            });
        });
    });

    it('Should return that api is online', function(done) {
        chai.request(app)
            .get('/heart')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.message.should.equal('Node api is online!');
                done();
            });
    });

    it('Should receive a token from valid login credentials', function(done) {
        chai.request(app)
            .post('/api/auth')
            .send({'username': user[0], 'password': user[1]})
            .end(function(err, res) {
                console.log(err);
                res.should.have.status(200);
                expect(res.body.token).to.exist;
            });
    });


});