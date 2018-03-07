'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const contestfundSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  contestid: { type: String },

  userid: { type: String },

  amount: { type: Number },

  joinflag: {type : Number}

});

module.exports = mongoose.model('Contestfund', contestfundSchema);
