'use strict';

const mongoose = require('mongoose');
const User = require('../models/user');
var Schema = mongoose.Schema;

const schema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  favourite_users: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' }
    },
  ]

});

module.exports = mongoose.model('favUser', schema);
