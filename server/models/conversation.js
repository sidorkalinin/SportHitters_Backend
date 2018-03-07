'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const conversationSchema = new mongoose.Schema({

  timestamp: { type: Date, default: Date.now },

  userid: { type: String },

  username: { type: String },

  gameid: { type: String },

  msg: { type: String },

  sport:{type:String},

  away:{type:String},

  home:{type:String},

  readflag:{type:Number, default: 0}

});

module.exports = mongoose.model('Conversation', conversationSchema);
