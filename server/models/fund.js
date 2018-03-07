'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const fundSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  userid: { type: String },

  type: { type: String },

  amount: { type: Number },

  cusid: { type: String },

  chargeid: { type: String }

});

module.exports = mongoose.model('Fund', fundSchema);
