'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const contestSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },

  sport: { type: String },

  checkedgroup: { type: Array },

  team: { type: Number },

  game: { type: Number },

  player: { type: Number },

  userid: { type: String },

  userlist: { type: Array },

  resultlist: {type : Array},

  endflag:{type : Number , default: 0}

});

module.exports = mongoose.model('Contest', contestSchema);
