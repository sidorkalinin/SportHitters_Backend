
const express = require('express');
const User = require('../models/user');
const favUser = require('../models/favourite')
const valid = require('../configs/validation');
var JWT = require('jwt-simple');
const config = require('../configs/config');

exports.ChangeFavStatus = function (req, res) {
    if (req.body.JWT) {
        var loginUser = JWT.decode(req.body.JWT, config.secretKeyJWT)
    } else if (req.query.JWT) {
        var loginUser = JWT.decode(req.query.JWT, config.secretKeyJWT)
    }
    favUser.findOne({ 'user': loginUser._id }).exec((err, favuser) => {
        console.log(favuser);
        if (err) {
            return res.send({ status: false, message: err });
        }
        if (favuser == null) {
            var fav_user = new favUser({
                user: loginUser._id,
                favourite_users: [
                    { user: req.body.user_id }
                ]
            });
            fav_user.save((err) => {
                if (err) {
                    return res.send({ status: false, message: err });
                }
                return res.send({ status: true, message: "Added to Favourites" });
            })
        }
        else if (favuser) {
            console.log(favuser);
            favUser.findOne({ '_id': loginUser._id }, function (err, user) {
                if (err) {
                    return res.send({ status: false, message: err });
                }
                if (user) {
                    console.log("asdasdasd", (user.favourite_users.indexOf(req.body.user_id) + 1))
                    if (!!(arr.indexOf(req.body.user._id) + 1)) {

                    }
                }
            })
        }
    });
};
exports.favUser = function (req, res) {
    if (req.body.JWT) {
        var loginUser = JWT.decode(req.body.JWT, config.secretKeyJWT)
    } else if (req.query.JWT) {
        var loginUser = JWT.decode(req.query.JWT, config.secretKeyJWT)
    }
    favUser.findOne({ '_id': loginUser._id }).exec((err, user) => {
        if (err) {
            return res.send(err);
        }
        return res.json(user);
    });
};
