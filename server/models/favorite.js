'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const favoriteSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  userid: { type: String },
  favidlist: { type: Array },
  favnamelist: { type: Array }
});

module.exports = mongoose.model('Favorite', favoriteSchema);
