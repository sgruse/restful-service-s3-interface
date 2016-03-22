'use strict';

var AWS = require('aws-sdk');
AWS.config.reqion = 'us-west-2';
var s3 = new AWS.S3();

var User = require(__dirname + '/../models/users-model');
var Files = require(__dirname + '/../models/files-model');

module.exports = (apiRouter) => {
  apiRouter.route('/files')
    .get((req, res) => {
      Files.find({}, (err, files) => {
        res.json(files)
        res.status(200)
      })
    })
  apiRouter.route('/files/:file')
    .get((req, res) => {
      Files.findById(req.params.file, (err, file) => {
        res.json(file)
        res.end();
      })
    })
    .put((req, res) => {
      req.on('data', (data) => {
        Files.findById(req.params.file, (err, file) => {
          console.log('find by id: ' + file);
          req.body = JSON.parse(data);
          var key = file.title;
          console.log('file name: ' + file.title);
          var params = {
            Bucket: 'user-files-sam-gruse',
            ACL: 'public-read-write',
            Key: key,
            Body: JSON.stringify(req.body.content)
          }
          s3.putObject(params, (err, data) => {
            if (err) throw err;
          })
          res.end();
        })
      })
    })
    .delete((req, res) => {
      Files.findById(req.params.file, (err, file) => {
        let params = {
          Bucket: 'user-files-sam-gruse',
          Key: file.fileName
        }
        s3.deleteObject(params, (err, data) => {
          if (err) throw err;
        })
        file.remove((err, file) => {
          res.status(200);
          res.json(file);
          console.log('The ' + file + ' has been deleted');
          res.end();
        });
      });
    });
  };
