'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const resultSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now },

  sport: { type: String },

  result: { type: Object },

});

module.exports = mongoose.model('Result', resultSchema);
