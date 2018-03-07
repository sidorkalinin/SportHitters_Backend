'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const userSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  firstname: { type: String },

  lastname: { type: String },

  username: { type: String, trim: true },

  displayname: { type: String, trim: true },

  password: { type: String, trim: true },

  email: { type: String, trim: true },

  role: { type: String, trim: true },

  last_active: { type: Date, default: Date.now },

  facebook_id: { type: String, trim: true },

  google_id: { type: String, trim: true },

  twitter_id: { type: String, trim: true },

  upgrade:{type: Number, default:0},

  account:{type: Object},

  profile:{type: Object},

  status:{type:String, default:"" }
});

userSchema.methods.generateHash = function (password) {

  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {

  return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);