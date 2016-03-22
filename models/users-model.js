'use strict';

const mongoose = require('mongoose');
let bcrypt = require('bcrypt');
const usersSchema = new mongoose.Schema({
  user: String,
  password: String,
  email: String,
  url: String,
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Files'
  }]
});
// 
// usersSchema.pre('save', function(next) {
//   // this.password = hashMyPassword(this.password)
//   this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10))
//   next();
// })
//
// // COMPARE OPERATOR
//
// usersSchema.methods.checkPassword = function(input) {
//
// }

module.exports = mongoose.model('Users', usersSchema);
