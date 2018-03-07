'use strict';

const mongoose = require('mongoose');
const User = require('../models/user');
var Schema = mongoose.Schema;

const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'Task name is required'] },
  note: { type: String, maxlength: [50, 'Only 50 characters or less is allowed'] },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: {type: Date},
  reminder: {type:Date},
  user:{ type: Schema.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Todo', schema);
