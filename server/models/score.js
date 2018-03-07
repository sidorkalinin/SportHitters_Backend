'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const scoreSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  userid: { type: String },

  contestid: { type: String },

  score: { type: Number },
  
  sport:{ type: String },
});

module.exports = mongoose.model('Score', scoreSchema);
