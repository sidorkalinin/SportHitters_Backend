'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const conversationreplySchema = new mongoose.Schema({

  timestamp: { type: Date, default: Date.now },

  from_id: { type: String },

  to_id: { type: String },

  con_id: { type: Number },

  reply: { type: String },

});

module.exports = mongoose.model('Conversationreply', contestSchema);
