'use strict';

const mongoose = require('mongoose');
// require('mongoose-type-url');

const filesSchema = new mongoose.Schema({
  fileName: String,
  author: String,
  imgae: String,
  url: String
});

module.exports = mongoose.model('Files', filesSchema);
