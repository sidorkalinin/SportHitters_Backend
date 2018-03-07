'use strict';

// dependencies
const express = require('express');
const Todo = require('../models/todo');
var mongoose = require('mongoose');
var ObjectId= mongoose.Types.ObjectId;

exports.getTasks = function (req, res) {
  Todo.find({ user: req.params.id, completed: false }).sort({ createdAt: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }

      return res.json(task);
    });
}

exports.postTask = function (req, res) {

  const task = new Todo({
    name: req.body.name,
    note: req.body.note,
    completed: req.body.completed,
    user: req.body.user,
    dueDate: req.body.dueDate,
    reminder: req.body.reminder
  });

  task.save((err) => {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: 'New task created!' });
  });
}

exports.getTask = function (req, res) {
  Todo.findById(req.params.id, (err, task) => {
    if (err) {
      return res.send(err);
    }
    return res.json(task);
  });
}

exports.updateTask = function (req, res) {
  Todo.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    note: req.body.note,
    user: req.body.user,
    dueDate: req.body.dueDate,
    reminder: req.body.reminder,
    completed: req.body.completed
  }, (err) => {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: 'Todo updated successfully' });
  });
};

exports.deleteTask = function (req, res) {
  Todo.remove({ _id: req.params.id }, (err) => {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: 'Todo has been removed!' });
  });
};