'use strict';

var AWS = require('aws-sdk');
AWS.config.reqion = 'us-west-2';
var s3 = new AWS.S3();
var fs = require('fs');

var Users = require(__dirname + '/../models/users-model');
var Files = require(__dirname + '/../models/files-model');

module.exports = (apiRouter) => {
  apiRouter.route('/users')
    .get((req, res) => {
      Users.find({}).populate('files').exec((err, users) => {
        res.json(users)
        res.status(200)
      })
    })
    .post((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data)
        var newUser = new Users(req.body)
        newUser.save((err, user) => {
          res.type('json');
          res.json(user);
          res.status(200);
        })
      })
    })

  apiRouter.route('/users/:user')
    .get((req, res) => {
      Users.findById(req.params.user, (err, user) => {
        res.json(user)
        res.status(200)
        res.end()
      })
    })
    .put((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data)
        Users.update({_id: req.params.user}, req.body, (err, user) => {
          console.log('User ' + user + ' has been updated');
          res.json(req.body)
          res.status(200)
          res.end();
        })
      })
    })
    .delete((req, res) => {
      Users.findById({_id: req.params.user}).populate('files').exec((err, user) => {
        if(user.files) {
        user.files.forEach((file) => {
          let params = {
            Bucket: 'user-files-sam-gruse',
            Key: file.fileName
          }
          s3.deleteObject(params, (err, data) => {
            if (err) throw err;
            console.log(data);
          })
          file.remove((err, file) => {
          })
        })
      }
        user.remove((err, user) => {
          res.status(200);
          res.json(user);
          console.log('The ' + user + ' has been deleted');
          res.end()
        })
      })
    })

  apiRouter.route('/users/:user/files')
    .get((req, res) => {
      Users.findById({_id: req.params.user}).populate('files').exec((err, user) => {
        res.json(user)
      })
    })
    .post((req, res) => {
      var newFileId;
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        var params = {
          Bucket: 'user-files-sam-gruse',
          Key: req.body.fileName,
          ACL: 'public-read-write',
          Body: JSON.stringify(req.body.content)
        }
        s3.putObject(params, (err, data) => {
          if (err) {
            res.status(404).end();
          }
        })
        s3.getSignedUrl('putObject', params, (err, url) => {
          var newUrl = new Files({url: url, fileName: req.body.fileName})
          newFileId = newUrl._id
          newUrl.save((err, url) => {
            Users.findByIdAndUpdate(req.params.user, {$push: {files: newFileId}}, (err, user) => {
              res.status(200);
              res.json(newUrl);
              res.end();
            });
          })
        })
      });
    });
  };
