'use strict';

let chai = require('chai');
let chaiHTTP = require('chai-http');
chai.use(chaiHTTP);

let request = chai.request;
let expect = require('chai').expect;
let url = require('url');
let fs = require('fs');
let mongoose = require('mongoose');
let User = require(__dirname + '/../models/users-model');
let File = require(__dirname + '/../models/files-model');

require(__dirname + '/../server');

// TESTING USER ROUTERS
describe('Testing "User" Router', () => {

  let userId;
  let fileId;
  let fileId2;
  let deletedUser;
  beforeEach((done) => {
    let newUser = new User ({user: 'Sam Gruse', email: 'sgruse89@gmail.com'})
    newUser.save((err, data) => {
      userId = data._id;
      done();
    })
  })
  beforeEach((done) => {
    let newFile = new File ({fileName: 'Test File', url: 'testfile.com'});
    newFile.save((err, data) => {
      fileId = data._id;
      done();
    })
  })
  beforeEach((done) => {
    let newFile2 = new File ({fileName: 'Test File 2', url: 'testfile2.com'})
    newFile2.save((err, data) => {
      fileId2 = data._id;
      done();
    })
  })

// TESTING GET
  it('Should return a json object and a status code of 200', (done) => {
    request('localhost:4000')
    .get('/users')
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      expect(res).to.be.a('object')
      done();
    })
  })
// TESTING POST
  it('Should create a new user', (done) => {
    request('localhost:4000')
    .post('/users')
    .send('{"user":"Bobby Boy", "email":"allday@gmail.com"}')
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a('object')
      expect(res.body.user).to.eql('Bobby Boy')
      expect(res.body.email).to.eql('allday@gmail.com')
      done();
    })
  })
// TESTING FIND USERS BY ID
  it('Should find the user created in the beforeEach block', (done) => {
    request('localhost:4000')
    .get('/users/' + userId)
    .end((err, res) => {
      expect(res.body._id).to.eql(userId.toString())
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a('object')
      done();
    })
  })
// TESTING PUT
  it('Should update a user inside of database', (done) => {
    request('localhost:4000')
    .put('/users/' + userId)
    .send('{"user":"Billy Jean"}')
    .end((err, res) => {
      expect(res.status).to.eql(200)
      expect(res).to.be.a('object')
      expect(res.body.user).to.be.eql('Billy Jean')
      done();
    })
  })
// TESTING DELETE USER FROM DATABASE
  it('Should delete a user from the database', (done) => {
    User.findById({_id: userId}, (err, user) => {
      deletedUser = user._id
    })
    request('localhost:4000')
    .delete('/users/' + userId)
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      // expect(res.body._id).to.eql(undefined)
      // expect(deletedUser).to.eql(undefined)
      done();
    })
  })
// TESTING FOR FILE SEARCH
  it('Should return the files created in the beforeEach block', (done) => {
    request('localhost:4000')
    .get('/files')
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      done();
    })
  })
// TESTING FOR POSTING A FILE TO SPECIFIC USER
  it('Should post a new file from an already exsisting user', (done) => {
    request('localhost:4000')
    .post('/users/' + userId + '/files')
    .send('{"fileName":"Testing Post", "url":"Test@yes.com"}')
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a('object')
      expect(res.body.fileName).to.eql('Testing Post')
      done();
    })
  })
// TESTING GET FILES BY ID
  it('Should find the file created in the beforeEach block', (done) => {
    request('localhost:4000')
    .get('/files/' + fileId)
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a('object')
      done();
    })
  })
// IT SHOULD DELETE A SPECIFIC FILE
  it('Should delete the file created in the', (done) => {
    request('localhost:4000')
    .delete('/files/' + fileId)
    .end((err, res) => {
      expect(err).to.eql(null)
      expect(res.status).to.eql(200)
      done();
    })
  })
// AFTER BLOCK TO DELETE MONGO DB
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      userId = null;
      fileId = null;
      fileId2 = null;
      deletedUser = null;
      done()
    })
  })
})
