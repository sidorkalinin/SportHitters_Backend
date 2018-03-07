
const express = require('express');
const User = require('../models/user');
const Contest = require('../models/contest');
const Contestfund = require('../models/contestfund');
const Conversation = require('../models/conversation');
const Favorite = require('../models/favorite');
const Score = require('../models/score');
const Fund = require('../models/fund');
const valid = require('../configs/validation');
var JWT = require('jwt-simple');
const config = require('../configs/config');
const nodemailer = require('nodemailer');
const https = require('https');
var request = require('request');
const async = require('async');

var http = require('http').Server(express);
var io = require('socket.io')(http);
var callapicount = 0;

exports.allUsers = function (req, res) {
    User.find({}).sort({ createdAt: -1 })
        .exec((err, user) => {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
};

exports.login = function (req, res) {
    if (req.body.username) {
        console.log("login by:- username ", req.body.username);
        localLogin(req, res);
    }
    else if (req.body.facebook_id) {
        console.log("login by facebook ", req.body.facebook_id);
        facebookLogin(req, res);
    }
    else if (req.body.google_id) {
        console.log("login by google ", req.body.google_id);
        googleLogin(req, res);
    }
    else if (req.body.twitter_id) {
        console.log("login by twitter_id ", req.body.twitter_id);
        twitterLogin(req, res);
    } else {
        return res.json({ status: false, message: 'Invalid Login Attempt!' });
    }
};

exports.signup = function (req, res) {
    if (req.body.username || req.body.email) {
        if(req.body.state == 'signup')
		{
			localSignup(req, res);
		}
		else if (req.body.state == 'forgotpassword')
		{
			userFind(req, res);
		}
    }
    else if (req.body.facebook_id) {
        facebookSignup(req, res);
    }
    else if (req.body.google_id) {
        googleSignup(req, res);
    }
    else if (req.body.twitter_id) {
        twitterSignup(req, res);
    } else {
        return res.json({ status: false, message: 'Invalid Signup Attempt!' });
    }
};


//jami
exports.addSocketId = function (userid, socketId) { 
    User.findOneAndUpdate({_id:userid},{status:socketId}).exec((err, task)=>{
        if (err) {
            return res.send(err);
        }
    });
};

exports.delSocketId = function (socketId) { 
    console.log("!@#$%^&*())(*&^%$#@!");
    User.findOneAndUpdate({status:socketId},{status:''}).exec((err, task)=>{
        if (err) {
            return res.send(err);
        }
    });
};

exports.setLogout = function(userid){
    var socketId = "";
    User.findOne({_id:userid}).exec((err,task1)=>{
        if(err)
            return 0;
        socketId = task1.status;
        User.findOneAndUpdate({_id:userid},{status:""}).exec((err, task)=>{
            if (err) {
                return 1;
            }
            return socketId;
        });
    });
}



exports.activesignup = function (req, res){
	registerUserInfo(req, res);
};

exports.registercontest = function (req, res) {
    contestreg(req, res);
};

exports.checkjoinuser = function (req, res) {
    checkjoinuser(req, res);
};

exports.getbysportcontest = function (req, res) {
    contestgetbysport(req, res);
};

exports.joinbysportcontest = function (req, res) {
    contestjoinbysport(req, res);
};

exports.getprevoptionlist = function (req, res) {
    getprevoptionlist(req, res);
};
exports.getallcontest = function (req, res) {
    //getallcontest(req, res);
    getallcontest2(req, res);
};

exports.getcontesttime = function (req, res) {
    getcontesttime(req, res);
};

exports.calculateContestResult = function () {    
    Contest.find()
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }

        var resultarray = [];
        var urls = [];
        var contestidarray = [];
        for (var i = 0; i < task.length; i++) {
            var eventCount = 0;
            var checkCount = 0;
            for(var k = 0; k < task[i].checkedgroup.length; k++){
                var checkedgrouparray = JSON.parse(task[i].checkedgroup[k]);
                for(var j = 0 ; j < checkedgrouparray.length; j++){
                    var flagtemp = false;
                    checkCount++;
                    for(var m = 0; m < task[i].resultlist.length; m++){
                        if(task[i].resultlist[m].indexOf(checkedgrouparray[j].eventid) != -1 && task[i].resultlist[m].indexOf("Final\":true") != -1){
                            flagtemp = true;
                            eventCount++;
                        }
                    }                   
                    if(flagtemp == false){
                        contestidarray.push(task[i]._id);
                        urls.push('https://jsonodds.com/api/results/'+checkedgrouparray[j].eventid+'?oddType=Game');
                        callapicount++;
                        console.log(new Date());
                        console.log(callapicount + "calculateContestResult");
                    }
                }
            }
            if(eventCount == checkCount){
                Contest.findByIdAndUpdate({ '_id': task[i]._id }, { $set: { endflag: 1 } }, function (err1, user) {
                });
            }
        }
        async.map(urls, httpGet, function (err1, res1){
            console.log(new Date());
            callapicount++;
            console.log(callapicount + "calculateContestResulthttpget");
            if (err1) return             
            saveResultPerContest(contestidarray, res1);
        });
      });
};

exports.getcontestbyid = function (req, res) {
    getcontestbyid(req, res);
};

exports.getresultbysport = function (req, res) {
    getresultbysport(req, res);
};

exports.getcontestinfobyid = function (req, res) {
    getcontestinfobyid(req, res);
};

exports.oddsgetsports = function (req, res) { 
    oddsgetsports(req, res);
};

exports.oddsgetsportstypegame = function (req, res) { 
    oddsgetsportstypegame(req, res);
};

exports.oddsgetodds = function (req, res) {
    oddsgetodds(req, res);
};

exports.savechat = function (req, res) { 
    savechat(req, res);
};

exports.addscore = function (req, res) { 
    addscore(req, res);
};

exports.getprevchat = function (req, res) { 
    getprevchat(req, res);
};

exports.getUnreadMessage = function (req, res) { 
    getUnreadMessage(req, res);
};

exports.deletefav = function (req, res) { 
    deletefav(req, res);
};

exports.addfav = function (req, res) { 
    addfav(req, res);
};

exports.addupgrade = function (req, res) { 
    addupgrade(req, res);
};

exports.getfavlist = function (req, res) { 
    getfavlist(req, res);
};

exports.getallchatbyuser = function (req, res) { 
    getallchatbyuser(req, res);
};

exports.getfundinfo = function (req, res) { 
    getfundinfo(req, res);
};

exports.postpay = function (req, res) { 
    postpay(req, res);
};

exports.postpayprev = function (req, res) { 
    postpayprev(req, res);
};

exports.postwithdraw = function (req, res) { 
    postwithdraw(req, res);
};

exports.getuserlist = function (req, res) { 
    getuserlist(req, res);
};

exports.savecontestfund = function (req, res) { 
    savecontestfund(req, res);
};

exports.addaccount = function (req, res) { 
    addaccount(req, res);
};

exports.addprofile = function (req, res) { 
    addprofile(req, res);
};

exports.setLogin = function (req, res) { 
    setLogin(req, res);
};

// exports.setLogout = function (req, res) { 
//     setLogout(req, res);
// };

exports.changePassword = function (req, res) {
    if (req.body.email) {
        if (!valid.email(req.body.email)) {
            return res.json({ status: false, message: 'Invalid Email' });
        }
        if (!valid.emailLength(req.body.email)) {
            return res.json({ status: false, message: 'Invalid Email Length' });
        }
///////////////////////////////////////////////////////////////////////////////
        var user = new User({
            username: req.body.username,
            password: req.body.pwd,
            firsname: req.body.firstname,
            displayname: req.body.displayname,
            lastname: req.body.lastname,
            email: req.body.email,
        });        
        user.password = user.generateHash(user.password);        
       
        User.findOneAndUpdate({ email: req.body.email},{$set: {password: user.password}})
        .exec((err7, task7) => {
          if (err7) {            
            return res.send({message:'cancel'});
          }
            task7.password = undefined;
            task7.createdAt = undefined;
            if (task7.displayname === undefined && task7.username) {
                task7.displayname = task7.username;
            }
            task7.password = undefined;
            task7.createdAt = undefined;
            res.setHeader('JWT', JWT.encode(task7, config.secretKeyJWT));
            var jwt = JWT.encode(task7, config.secretKeyJWT);
            return res.json({ status: true, message: 'New Password Created!', user: task7, JWT: JWT, JWT: jwt });
        });

    } else {
        return res.json({ status: false, message: "Invalid Request" })
    }
}



















































//////////////local////functions////////////////
var sendactivatecode = function (user, res) {
	  var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'registersporthitters@gmail.com', // Your email id
            pass: 'Launch2017!' // Your password
        }
    });

	var pincode = Math.floor(1000 + Math.random() * 9000).toString();
	var text = "Thank you for getting started with SportHitters! We need a little more information to complete your registration, including confirmation of your email address. Reference below activate code to confirm your email address:" + pincode;


	var mailOptions = {
		from: 'registersporthitters@gmail.com', // sender address
		to: user.email, // list of receivers
		subject: 'SportHitters', // Subject line
		text: text //, // plaintext body
	};

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
			return res.json({ status: false, message: error });
		}else{
			console.log('Message sent: ' + info.response);
			var message = "Activate code was sent to your email.";
            return res.json({ status: true, message: message, code: pincode, user: user });
			
		};

	});
}

var setLogin = function(req, res){
    var userid = req.body.userid;
    User.find({status:{$gt:""}}).exec((err1, task1) => {
        if(err1){
            return res.send(err);
        }
        var data = Array();
        task1.forEach(function(element){
            var val = { userid: element._id, socketId : element.status };
            data.push(val);
        });
        res.send(data);
    });
}

var registerUserInfo = function (req, res){
	var user = new User({
		username: req.body.username,
        password: req.body.password,
        firsname: req.body.firstname,
        displayname: req.body.displayname,
        lastname: req.body.lastname,
        email: req.body.email,
	});
    user.password = user.generateHash(user.password);
    console.log(user);
	user.save((err) => {
		if (err) {
			return res.send(err);
		}
	
		User.findOne({ 'email': req.body.email }, function (err, user) {
			if (err) {
				return res.send(err);
			}                         
			else {
				user.password = undefined;
				user.createdAt = undefined;
				if (user.displayname === undefined && user.username) {
					user.displayname = user.username;
				}
				user.password = undefined;
				user.createdAt = undefined;
				res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
				var jwt = JWT.encode(user, config.secretKeyJWT);
				return res.json({ status: true, message: 'New User Created!', user: user, JWT: JWT, JWT: jwt });

			}
                 
		});
	});

}

var localSignup = function (req, res) {
    if (req.body.username) {
        if (!valid.usernameLength(req.body.username)) {
            return res.json({ status: false, message: 'Invalid Username Length' });
        }
    }
    if (req.body.email) {
        if (!valid.email(req.body.email)) {
            return res.json({ status: false, message: 'Invalid Email' });
        }
        if (!valid.emailLength(req.body.email)) {
            return res.json({ status: false, message: 'Invalid email Length' });
        }
    }
    if (req.body.password) {
        if (!valid.passwordLength(req.body.password)) {
            return res.json({ status: false, message: 'Invalid password Length' });
        }
    }
    if (req.body.username) {
        User.findOne({ 'username': req.body.username }, function (err, user) {
            if (err) {
                return res.send(err);
            }
            if (user) {
                return res.json({ status: false, message: 'User already registered.' });
            } else {
                User.findOne({ 'email': req.body.email }, function (err1, user1) {
                    if (err1) {
                        return res.send(err);
                    }
                    if (user1) {
                        return res.json({ status: false, message: 'Email already registered.' });
                    }

                    var user = new User({
                        username: req.body.username,
                        password: req.body.password,
                        firsname: req.body.firstname,
                        displayname: req.body.displayname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                    });
					sendactivatecode(user, res);

                });
            }
        });
    } else if (req.body.email) {
        User.findOne({ 'email': req.body.email }, function (err, user) {
            if (err) {
                return res.send(err);
            }
            if (user) {
                return res.json({ status: false, message: 'User already registered.' });
            } else {
                    var user = new User({
                        username: req.body.username,
                        password: req.body.password,
                        firsname: req.body.firstname,
                        displayname: req.body.displayname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                    });
					sendactivatecode(user, res);
            }
        });
    } else {
        return res.json({ status: false, message: 'Oops! something went wrong, try again later' });
    }
}
var facebookSignup = function (req, res) {
    User.findOne({ 'facebook_id': req.body.facebook_id }, function (err, user) {
        if (err) {
            return res.send(err);
        }
        if (user) {
            user.createdAt = undefined;

            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);

            return res.json({ status: true, message: 'User already registered. User successfully logged in.', user: user, JWT: jwt });
        } else {
            var user = new User({
                username: req.body.username,
                firsname: req.body.firstname,
                displayname: req.body.displayname,
                lastname: req.body.lastname,
                email: req.body.email,
                facebook_id: req.body.facebook_id,
            });
            user.save((err) => {
                if (err) {
                    return res.send(err);
                }
                User.findOne({ 'facebook_id': req.body.facebook_id }, function (err, user) {
                    if (err) {
                        return res.send(err);
                    } else {
                        user.createdAt = undefined;
                        user.last_active = undefined;
                        res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
                        var jwt = JWT.encode(user, config.secretKeyJWT);

                        return res.json({ status: true, message: 'New User Created!', user: user, JWT: jwt });
                    }
                });
            });
        }
    });

}

var googleSignup = function (req, res) {
    User.findOne({ 'google_id': req.body.google_id }, function (err, user) {
        if (err) {
            return res.send(err);
        }
        if (user) {
            user.createdAt = undefined;
            user.last_active = undefined;
            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);

            return res.json({ status: true, message: 'User already registered. User successfully logged in.', user: user, JWT: jwt });
        }
        else {
            var user = new User({
                username: req.body.username,
                firsname: req.body.firstname,
                displayname: req.body.displayname,
                lastname: req.body.lastname,
                email: req.body.email,
                google_id: req.body.google_id,
            });
            user.save((err) => {
                if (err) {
                    return res.send(err);
                }
                User.findOne({ 'google_id': req.body.google_id }, function (err, user) {
                    if (err) {
                        return res.send(err);
                    } else {
                        user.createdAt = undefined;
                        user.last_active = undefined;
                        res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
                        var jwt = JWT.encode(user, config.secretKeyJWT);

                        return res.json({ status: true, message: 'New User Created!', user: user, JWT: jwt });
                    }
                });
            });
        }
    });
}

var twitterSignup = function (req, res) {
    User.findOne({ 'twitter_id': req.body.twitter_id }, function (err, user) {
        if (err) {
            return res.send(err);
        }
        if (user) {
            user.createdAt = undefined;
            user.last_active = undefined;
            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);

            return res.json({ status: true, message: 'User already registered. User successfully logged in.', user: user, JWT: jwt });
        } else {
            var user = new User({
                username: req.body.username,
                firsname: req.body.firstname,
                displayname: req.body.displayname,
                lastname: req.body.lastname,
                email: req.body.email,
                twitter_id: req.body.twitter_id
            });
            user.save((err) => {
                if (err) {
                    return res.send(err);
                }
                User.findOne({ 'twitter_id': req.body.twitter_id }, function (err, user) {
                    if (err) {
                        return res.send(err);
                    } else {
                        user.createdAt = undefined;
                        user.last_active = undefined;
                        res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
                        var jwt = JWT.encode(user, config.secretKeyJWT);
                        return res.json({ status: true, message: 'New User Created!', user: user, JWT: jwt });
                    }
                });
            });
        }
    });
}

var userFind = function (req, res) {
	User.findOne({ 'email': req.body.email }, function (err, user) {
		console.log(user);
        if (err) {
            return res.send(err);
        }
        
        if (!user) {
            return res.json({ status: false, message: 'User is not registered' });
        }

		sendactivatecode(user, res);
	})
}

var localLogin = function (req, res) {    
    
    if (req.body.password) {
        if (!valid.passwordLength(req.body.password)) {
            return res.json({ status: false, message: 'Invalid password length' });
        }
    } else {
        return res.json({ status: false, message: 'Invalid password' });
    }


    User.findOne({ $or: [{ 'username': req.body.username}, { 'email': req.body.username}] }, function (err, user) {
        console.log(user);
        if (err) {
            return res.send(err);
        }
        
        if (!user) {
            return res.json({ status: false, message: 'User is not registered' });
        }

        if (!user.validPassword(req.body.password)) {
            return res.json({ status: false, message: 'Incorrect password' });
        }
        
        user.password = undefined;
        user.createdAt = undefined;
        user.last_active = undefined;
        res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
        var jwt = JWT.encode(user, config.secretKeyJWT);
        user.last_active = undefined;
        User.findByIdAndUpdate({ '_id': user._id }, { $set: { last_active: new Date() } }, function (err, user) {
            if (err) {
                return res.json({ status: false, message: 'Oops! something went wrong, try again later' });
            }
            if (user) {
                return res.json({ status: true, message: 'User successfully logged in.', user: user, JWT: jwt });
            }
        });
    })
}
var facebookLogin = function (req, res) {
    User.findOne({ 'facebook_id': req.body.facebook_id }, function (err, user) {
        if (err) {
            return res.json({ status: false, message: err });
        }
        if (user) {
            user.createdAt = undefined;
            user.last_active = undefined;
            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);
            User.findByIdAndUpdate({ '_id': user._id }, { $set: { last_active: new Date() } }, function (err, user) {
                if (err) {
                    return res.json({ status: false, message: 'Oops! something went wrong, try again later' });
                }
                if (user) {
                    return res.json({ status: true, message: 'User successfully logged in.', user: user, JWT: jwt });
                }
            });
        } else {
            facebookSignup(req, res);
        }
    })
}
var googleLogin = function (req, res) {
    User.findOne({ 'google_id': req.body.google_id }, function (err, user) {
        if (err) {
            return res.json({ status: false, message: err });
        }
        if (user) {
            user.createdAt = undefined;
            user.last_active = undefined;
            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);

            User.findByIdAndUpdate({ '_id': user._id }, { $set: { last_active: new Date() } }, function (err, user) {
                if (err) {
                    return res.json({ status: false, message: 'Oops! something went wrong, try again later' });
                }
                if (user) {
                    return res.json({ status: true, message: 'User successfully logged in.', user: user, JWT: jwt });
                }
            });
        } else {
            googleSignup(req, res);
        }
    })
}
var twitterLogin = function (req, res) {
    User.findOne({ 'twitter_id': req.body.twitter_id }, function (err, user) {
        if (err) {
            return res.json({ status: false, message: err });
        }
        if (user) {
            user.createdAt = undefined;
            user.last_active = undefined;
            res.setHeader('JWT', JWT.encode(user, config.secretKeyJWT));
            var jwt = JWT.encode(user, config.secretKeyJWT);

            User.findByIdAndUpdate({ '_id': user._id }, { $set: { last_active: new Date() } }, function (err, user) {
                if (err) {
                    return res.json({ status: false, message: 'Oops! something went wrong, try again later' });
                }
                if (user) {
                    return res.json({ status: true, message: 'User successfully logged in.', user: user, JWT: jwt });
                }
            });
        } else {
            twitterSignup(req, res);
        }
    })
}

var contestreg = function (req, res) {
    // request({
    //     headers: {         
    //       'Access-Control-Allow-Origin': '*',
    //       'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
    //     },
    //     uri: 'https://jsonodds.com/api/odds/'+req.body.name+'?oddType=GAME',       
    //     method: 'GET'
    //   }, function (err, response) {        
        
    //     const contest = new Contest({
    //         userid: req.body.userid,
    //         info: response.body,            
    //         checkedgroup: req.body.checkedgroup,
    //         sport: req.body.name.toLowerCase(),
    //         team: req.body.team,
    //         player: req.body.player,           
    //         userlist: '',
    //         game: req.body.game            
    //     });
        
    //     contest.save((err) => {
    //         if (err) {
    //         return res.send(err);
    //         }
    //         return res.json({ message: 'Success!' });
    //     });
    //   });
    const contest = new Contest({
        userid: req.body.userid,         
        checkedgroup: req.body.checkedgroup,
        sport: req.body.name.toLowerCase(),
        team: req.body.team,
        player: req.body.player,           
        userlist: [],
        game: req.body.game,
        resultlist: []
    });
    
    contest.save((err,docsInserted) => {
        if (err) {
        return res.send(err);
        }
        return res.json({ message: docsInserted });
    });
}

var checkjoinuser = function (req, res) {

    Contest.find({userlist: { $eq: req.body.userid }, _id: req.body.id}).sort({ createdAt: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
      return res.json(task);
    });
    
}

var contestgetbysport = function (req, res) {
    

    Contest.find({ sport: req.body.name, player: req.body.player, game: req.body.game, team: req.body.team }).sort({ createdAt: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
     return res.json(task);      
    });

}

var getprevoptionlist = function (req, res) {

    Contest.find( { userid: req.body.userid, sport: req.body.sport}).sort({ createdAt: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
      return res.json(task);
    });
    
}

var contestjoinbysport = function (req, res) {
    if(req.body.game == "Free"){
         req.body.game = 0;
    }
    else{
        req.body.game = parseInt(req.body.game) * -1;
    }

    Contest.findByIdAndUpdate({ '_id': req.body.id }, { $push: { 'userlist': req.body.joinuser, 'checkedgroup': req.body.checkedgroup } }, function (err, user) {
        if (err) {
            return res.json({ status: false});
        }
        if(user){

                Contestfund.findOne({ userid : req.body.joinuser, contestid: req.body.id, joinflag: 1}).exec((err1, task1)=>{
                    if (err1) {
                        return res.send(err1);
                    }
                    
                    if(task1 == null){
                        var contestfund = new Contestfund({
                            userid: req.body.joinuser,
                            amount: req.body.game,
                            contestid: req.body.id                
                        });
                        
                        contestfund.save((err) => {
                            if (err) {
                                return res.send(err);
                            }
                        });
                    }
                    else{
                        Contestfund.findOneAndUpdate({ userid : req.body.joinuser, contestid: req.body.id},
                            {  $inc: { amount: req.body.game}},
                            { upsert:true, returnNewDocument : false }).exec((err, task)=>{
                            if (err) {
                                return res.send(err);
                            }                            
                        });
                    }
                    
                });
        }
        return res.json({ status: false});

    });
}


function httpGet(url, callback) {
      const options = {
            url :  url,
            json : true
      };
    request({
            headers: {         
              'Access-Control-Allow-Origin': '*',
              'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
            },
            uri: url,    
            method: 'GET'
          }, function (err, response, body) {  
            callapicount++;
            console.log(callapicount + "httpGet");          
            callback(err, body);
          });
}

var getallcontest2 = function (req, res) {
    var user = req.params.id;
    Contest.find({ userlist: { $eq: user } }).sort({ sport: -1 })
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }
        var resultarray = [];
        var resarray = [];
        var contestidarray = [];
        var sportarray = [];
        for (var i = 0; i < task.length; i++) {
            var force = task[i].userlist.indexOf(user);
            var checkedgrouparray = JSON.parse(task[i].checkedgroup[force]);
            for(var j = 0 ; j < checkedgrouparray.length; j++){
                contestidarray.push(task[i]._id);
                sportarray.push(task[i].sport);
                resultarray.push(checkedgrouparray[j]);
                resarray.push(task[i].resultlist);               
            }
        }
        res.send({checked:resultarray,res:resarray,contest:contestidarray,sport:sportarray});
    });
}

var getallcontest1 = function (req, res) {
    var user = req.params.id;
    Contest.find({ userlist: { $eq: user } }).sort({ sport: -1 })
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }
        var resultarray = [];
        var urls = [];
        var contestidarray = [];
        var sportarray = [];
        for (var i = 0; i < task.length; i++) {
            var force = task[i].userlist.indexOf(user);
            var checkedgrouparray = JSON.parse(task[i].checkedgroup[force]);
            for(var j = 0 ; j < checkedgrouparray.length; j++){
                contestidarray.push(task[i]._id);
                sportarray.push(task[i].sport);
                resultarray.push(checkedgrouparray[j]);
                urls.push('https://jsonodds.com/api/results/'+checkedgrouparray[j].eventid+'?oddType=Game');
                callapicount++;                
                console.log(callapicount + "getallcontest1");   
            }
        }
        async.map(urls, httpGet, function (err1, res1){
            if (err1) return console.log(err1);            
            return res.send({checked:resultarray,res:res1,contest:contestidarray,sport:sportarray});  
        });              
      });
}

var getallcontest = function (req, res) {
    var user = req.params.id;
    Contest.find({ userlist: { $eq: user } }).sort({ sport: -1 })
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }
        var tempsportarray = [];
        var tempsport = "";
        for(var i = 0; i < task.length; i++){
            if(tempsport != task[i].sport){
                tempsportarray.push(task[i].sport);
                tempsport = task[i].sport;
            }
        }
        reflexgetresultbysport(tempsportarray.length-1,task,tempsportarray,[],res);
      });
}

var reflexgetresultbysport = function (i, task, sportarray, result, res){
    if(i < 0){
        return res.send({task:task,result:result});
    }
    request({
            headers: {         
              'Access-Control-Allow-Origin': '*',
              'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
            },
            uri: 'https://jsonodds.com/api/results/'+sportarray[i]+'?oddType=Game',    
            method: 'GET'
          }, function (err, response) {
            callapicount++;
            console.log(callapicount + "reflexgetresultbysport");
            result.push(response.body);
            reflexgetresultbysport(i-1,task,sportarray,result,res);
          });
}

var reflexgetresult = function (i, results, task, res, j, user){
    var force = 0;
            for(var k = 0; k < task[i].userlist.length; k++){
                if(task[i].userlist[k] == user){
                    force = k;
                }
            }  
    if(i == 1 && j == 0){
        return res.json(results);
    }       
    else if(j == 0){  
        i--;
        j = JSON.parse(task[i].checkedgroup[force]).length;        
    }
    if(JSON.parse(task[i].checkedgroup[force])[j-1] == ""){        
        reflexgetresult(i, results, task, res, j-1, user);
    }
    else{
        request({
            headers: {
              'Access-Control-Allow-Origin': '*',
              'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
            },
            uri: 'https://jsonodds.com/api/results/'+JSON.parse(task[i].checkedgroup[force])[j-1].eventid+'/?oddType=Game',    
            method: 'GET'
          }, function (err, response) {
            callapicount++;
            console.log(callapicount + "reflexgetresult");
            if(err)
                return res.send(err);
            if(response.body != undefined){
                results.push({id:task[i]._id,sport:task[i].sport,inx:i,check:JSON.parse(task[i].checkedgroup[force])[j-1],result:JSON.parse(response.body)[0]});
            }
            reflexgetresult(i, results, task, res, j-1, user);
          });
    }
}

var getcontestbyid = function (req, res) {
    var contestid = req.params.contestid.substring(1);
    Contest.find({ _id: contestid })
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }
        
        User.find()
            .exec((erri, taski) => {
                if (erri) {
                    return res.send(erri);
                }
                
                var userarr = [];
                for(var i = 0; i < taski.length; i++){
                    for(var j = 0; j < task[0].userlist.length; j++){
                        if(String(taski[i]._id)== String(task[0].userlist[j])){
                            userarr.push(taski[i]);
                        }
                    }
                }
                return res.send(userarr);
            });
      });
}

var getcontestinfobyid = function (req, res) {
    var contestid = req.params.contestid.substring(1);
    Contest.find({ _id: contestid })
    .exec((err, task) => {
        if (err) {
          return res.send(err);
        }
        return res.send(task);
      });
}

var oddsgetsports = function (req, res){
    request({
        headers: {         
          'Access-Control-Allow-Origin': '*',
          'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
        },
        uri: 'https://jsonodds.com/api/sports',       
        method: 'GET'
      }, function (err, response) {
        callapicount++;
        console.log(callapicount + "oddsgetsports");
        if(err)
            return res.send(err);
        return res.json({data:response.body});
      });
}
var oddsgetsportstypegame = function (req, res) {
    var sport = req.params.id.substring(1);
    ///'https://jsonodds.com/api/odds/'.$id.'?oddType=GAME'
    request({
        headers: {         
          'Access-Control-Allow-Origin': '*',
          'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
        },
        uri: 'https://jsonodds.com/api/odds/'+sport+'/?oddType=Game',
        method: 'GET'
      }, function (err, response) {
        console.log(err);
        if(err)
            return res.json(err);
        callapicount++;
        console.log(callapicount + "oddsgetsportstypegame");
        return res.json({data:response.body});
      });    
}

var oddsgetodds = function (req, res) {
    var sport = req.params.id.substring(1);
    ///'https://jsonodds.com/api/odds/'.$id.'?oddType=GAME'
    request({
        headers: {         
          'Access-Control-Allow-Origin': '*',
          'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
        },
        uri: 'https://jsonodds.com/api/odds/'+sport+'/?oddType=Game',
        method: 'GET'
      }, function (err, response) { 
        callapicount++;
        console.log(err + "oddsgetodd+++++++++++++++++");
        // console.log(response);
        return res.json({data:response.body});
      });
}

var getresultbysport = function (req, res) {
    var sport = req.params.sport;
    
    request({
        headers: {         
          'Access-Control-Allow-Origin': '*',
          'x-api-key' : '010d5969-8fee-45ac-94e8-42b814eeecae'
        },
        uri: 'https://jsonodds.com/api/results/'+sport,    
        method: 'GET'
      }, function (err, response) {
        callapicount++;
        console.log(callapicount + "getresultbysport");  
        return res.json(response.body);
      });    
}

var getprevchat = function (req, res) {
    var pos = req.body.pos; 
    var gameid = req.body.gameid; 
    var userid = req.body.userid;
    var userflag = req.body.userflag; 
    // if(userid != undefined){
    //     Conversation.find({ gameid: gameid, userid:userid}).sort({ timestamp: -1 }).skip(pos).limit(10)
    //     .exec((err, task) => {
    //       if (err) {
    //         return res.send(err);
    //       }
    //       Conversation.find({ userid: gameid, gameid:userid}).sort({ timestamp: -1 }).skip(pos).limit(10)
    //         .exec((err, task) => {
    //           if (err) {
    //             return res.send(err);
    //           }
              
    //           return res.json(task);
    //         });
    //       return res.json(task);
    //     });
    // }
    if(userflag == true){
        console.log("readflat***********************************************1111111111111");
        Conversation.find({$or : [{ gameid: userid, userid:gameid}, { gameid: gameid, userid:userid}]}).sort({ timestamp: -1 }).skip(pos).limit(10)
        .exec((err, task) => {
          if (err) {
            return res.send(err);
          }
          task.forEach(function(element){
                if(!element.readflag){
                    // var val = element.readflag;
                    // val.push(userid);
                    // console.log("val"+val);
                    Conversation.findOneAndUpdate({_id:element._id},{readflag:1})
                        .exec((err, task)=>{
                            console.log("ADDDDDDDDDDDDDDDDDD");
                        });
                }
          });
          return res.json(task);
        });
    }
    else{
       Conversation.find({ gameid: gameid}).sort({ timestamp: -1 }).skip(pos).limit(10)
        .exec((err, task) => {
          if (err) {
            return res.send(err);
          }
          return res.json(task);
        });
    }
}

//Jami
var getUnreadMessage = function(req, res){
    var pos = req.body.pos; 
    var userid = req.body.userid;
    Conversation.find({ gameid: userid, readflag:0}).sort({ timestamp: -1 }).skip(pos).limit(10)
        .exec((err, task) => {
          if (err) {
            return res.send(err);
          }
          console.log(task);
          var data = {};
          var idArr = Array();
          task.forEach(function(element){
            if(data[element.userid]){
                var val = data[element.userid];
                val.push(element);
                data[element.userid] = val;
            }else{
                data[element.userid] = Array();
                data[element.userid].push(element);
            }
          });
          return res.json(data);
        });
}

var savechat = function (req, res) {
//text: this.message,name:user['username'], userid:user['_id'], gameid:this.nickname
    const conversation = new Conversation({
        userid: req.body.userid,
        msg: req.body.text,
        gameid: req.body.gameid,
        username: req.body.name,
        sport:req.body.sport,
        away:req.body.away,
        home:req.body.home,
    });
    conversation.save((err,docsInserted) => {
        if (err) {
        return res.send(err);
        }
        return res.send(docsInserted);
    });
}

var addscore = function (req, res) {
    var data = req.body.data;
    var sport = req.body.sport;
    var contestid = req.body.contestid;
     Score.findOneAndUpdate({ userid : req.body.userid, contestid : contestid},
            {  'score': req.body.score, 'sport': sport},
                { upsert:true, returnNewDocument : false }).exec((err, task)=>{
                if (err) {
                    return res.send(err);
                }  
                for(var i = 0; i < data.length; i++){
                    var wllist = data[i].wllist;
                    var score = 0;
                    for(var j = 0; j < wllist.length; j++){
                        if(wllist[j] == "W"){
                            score++;
                        }
                    }
                    score = Math.round(score*100/data[i].wllist.length);

                    Score.findOneAndUpdate({ userid : data[i].userid, contestid : contestid},
                        {  'score': score, 'sport': sport},
                            { upsert:true, returnNewDocument : false }).exec((err, task)=>{
                            if (err) {
                                return res.send(err);
                            }                
                        }); 
                }            
            }); 
}


var getfundinfo = function (req, res) {    
    var userid = req.body.userid; 
    
    Fund.find({ userid: userid})
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
            Contestfund.find({ userid: userid})
            .exec((err1, task1) => {
                  if (err1) {
                    return res.send(err1);
                  }
                  
                  return res.send({fund:task,contestfund:task1});
            });
      
    });
}

var postpay = function (req, res) {
    var stripetoken = req.body.token1;
    var custoken = req.body.token2;
    var amountpayable = req.body.amount;
    var userid = req.body.userid;
    var type = req.body.type;
    const stripe1 = require('stripe')('sk_live_ijOS4utq5uNF6EtR2aUe2rih');
    console.log(parseInt(amountpayable));
    if(type == "existcard"){
            stripe1.charges.create({
              amount: parseInt(amountpayable)*100,
              currency: "USD",
              customer: stripetoken,
            },function(err5, charge5){
                if(err5){
                    console.log(err5);                    
                }
                console.log(charge5.id);
                Fund.findOne({ _id: custoken})
                    .exec((err6, task) => {
                      if (err6) {
                        console.log(err6);                        
                      }
                      var amount1 = parseInt(amountpayable) + parseInt(task.amount);                      
                      Fund.findOneAndUpdate({ _id: custoken},{$set: {amount: amount1, chargeid:charge5.id}})
                        .exec((err7, task7) => {
                          if (err7) {
                            console.log(err7); 
                            return res.send({message:'cancel'});
                          }
                          return res.send({message:'ok'});      
                        });
                    });
            });
    }
    else if(type == "card"){
        //const stripe1 = require('stripe')('sk_test_uSLzauXgm3FVCM0Ij9Uj8WzG');
        //const stripe1 = require('stripe')('sk_test_VTYUbhQy85dWk0UPMJFdWZUA');
        
        stripe1.customers.create({
            email: req.body.useremail,
            source: stripetoken,
        }, function(err2, customer2) {
            // asynchronously called
            if(err2){
                console.log(err2);
            }
            else{
                
                const charge = stripe1.charges.create({
                  amount: parseInt(amountpayable)*100,
                  currency: 'USD',
                  source: custoken,
                  description: 'test payment'
                }, function(err, charge){        
                    if (err){    
                        console.log(err);                        
                    }
                    else{
                        const fund = new Fund({
                            userid: userid,
                            amount: amountpayable,
                            type: type,
                            cusid:customer2.id,
                            chargeid:charge.id
                        });
                        
                        fund.save((err3,docsInserted) => {
                            if (err3) {
                            return res.send({message:'cancel'});
                            }        
                            return res.send({message:'ok'});
                        });
                    }    
                });
            }
        });
    }
}

var postpay1 = function (req, res) {    
    var amountpayable = req.body.amount;
    var userid = req.body.userid;
    var type = req.body.type;
    var cardinfo = req.body.cardinfo;
    // Create a payment from a test card token.
    const fund = new Fund({
                userid: userid,
                amount: amountpayable,
                type: type,
                cardinfo:cardinfo
            });
            
            fund.save((err,docsInserted) => {
                if (err) {
                return res.send(err);
                }        
                return res.send(docsInserted);
            });
}

var postpayprev = function (req, res) {    
    var amount = req.body.amount;
    var fundid = req.body.fundid; 
    
    Fund.findOne({ _id: fundid})
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }

      var amount1 = parseInt(amount) + parseInt(task.amount);

      Fund.findOneAndUpdate({ _id: fundid},{$set: {amount: amount1}})
        .exec((err1, task1) => {
          if (err1) {
            return res.send(err);
          }
          return res.send({message:'successfully'});      
        });
    });
}

var postwithdraw = function (req, res) { 
    const stripe = require('stripe')('sk_live_ijOS4utq5uNF6EtR2aUe2rih');   
    var amount = req.body.amount;
    var fundid = req.body.fundid;
    var cusid = req.body.stripetoken;
    if(fundid != "upgrade"){
            stripe.refunds.create({
              currency: "USD",
              amount: parseInt(amount)*100,
              charge:cusid
            }, function(err1, refund) {
              // asynchronously called
              if(err1){
                console.log(err1);
                return res.send({message:'invalid'});
              }
              else{
                Fund.findOne({ _id: fundid})
                .exec((err, task) => {
                  if (err) {
                    console.log(err);
                    return res.send({message:'invalid'});
                  }
                  if(parseInt(amount)>parseInt(task.amount)){
                    return res.send({message:'invalid'});
                  }
                  var amount1 = parseInt(task.amount)-parseInt(amount);

                  Fund.findOneAndUpdate({ _id: fundid},{$set: {amount: amount1}})
                    .exec((err1, task1) => {
                      if (err1) {
                        return res.send("err");
                      }
                      return res.send({message:'ok'});
                    });
                });
              }
            });
    }
    else{
        //cusid
        Fund.find({ userid: cusid})
            .exec((err1, task1) => {
              if (err1) {
                return res.send({message:'invalid'});
              }              
              refpostwithdraw(amount, task1, res, task1.length-1); 
            });
    }

    
}

var refpostwithdraw = function (amount, task, res, inx) {   
    const stripe = require('stripe')('sk_live_ijOS4utq5uNF6EtR2aUe2rih');  
    if(amount > task[inx].amount){
        stripe.refunds.create({
              currency: "USD",
              amount: parseInt(task[inx].amount)*100,
              charge:task[inx].cusid
            }, function(err1, refund) {
              // asynchronously called
              if(err1){
                console.log("err1");  
                return res.send(err1);              
              }
              else{
                Fund.findOne({ _id: task[inx]._id})
                .exec((err, task) => {
                  if (err) {
                    console.log("err3");
                    return res.send(err);
                  }
                  
                  var amount1 = 0;

                  Fund.findOneAndUpdate({ _id: task[inx]._id},{$set: {amount: amount1}})
                    .exec((err2, task2) => {
                      if (err2) {
                        console.log("err4");
                        return res.send(err2);  
                      }
                      refpostwithdraw(amount-task[inx].amount, task, res, inx-1);
                    });
                });
              }
            });
    }
    else{
        stripe.refunds.create({
              currency: "USD",
              amount: parseInt(amount)*100,
              charge:task[inx].cusid
            }, function(err1, refund) {
              // asynchronously called
              if(err1){
                console.log("err5"); 
                return res.send(err1);               
              }
              else{
                Fund.findOne({ _id: task[inx]._id})
                .exec((err, task) => {
                  if (err) {
                    console.log("err6");
                    return res.send(err);
                  }
                  
                  var amount1 = parseInt(task[inx].amount)-parseInt(amount);

                  Fund.findOneAndUpdate({ _id: task[inx]._id},{$set: {amount: amount1}})
                    .exec((err2, task2) => {
                      if (err2) {
                        return res.send(err2);
                      }
                      return res.send({message:'ok'});
                    });
                });
              }
            });
    }
} 

var getallchatbyuser = function (req, res) {    
    var userid = req.body.userid; 
    
    Conversation.find({ userid: userid}).sort({ gameid: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
      return res.send(task);      
    });
}

var addupgrade = function (req, res) {    
    var userid = req.body.userid; 
    
    User.findOneAndUpdate({ _id : userid},
                        {  'upgrade': 1},
                            { upsert:true, returnNewDocument : false }).exec((err, task)=>{
                            if (err) {
                                return res.send(err);
                            }
                            return res.send({message:'ok'});    
                        }); 
}

var addfav = function (req, res) {
    var favid = req.body.favid; 
    var favname = req.body.favname; 
    var userid = req.body.userid;
    var flag = req.body.flag;
    Favorite.findOne({ userid: userid})
    .exec((err, task) => {
      if (err) {
        console.log(err);
      }
      if(task){
        
        var favnamelist = task.favnamelist;
        var favidlist = task.favidlist;
        var tempnamelist = [];
        var tempidlist = [];
        if(flag == 0){
            for(var i = 0; i < favnamelist.length; i++){
                if(favidlist[i]!=favid){
                    tempidlist.push(favidlist[i]);
                    tempnamelist.push(favnamelist[i]);
                }
            }
            Conversation.find({userid:favid,gameid:userid},{readflag:1}).exec((err,task)=>{
                if(err)
                    return err;
            })
        }
        else{
            var inx = task.favidlist.indexOf(favid);
            tempnamelist = favnamelist;
            tempidlist = favidlist;
            if(inx === -1){
                tempnamelist.push(favname);
                tempidlist.push(favid);
            }
        }

        Favorite.findOneAndUpdate({ userid : userid},
            {$set: {favnamelist: tempnamelist, favidlist:tempidlist}},
            { upsert:false, returnNewDocument : false }).exec((err1, task1)=>{
            if (err1) {
                return res.send(err1);
            }
            return res.send({message:'ok'});
        });
      }
      else{
        
        if(flag != 0){
            const favorite = new Favorite({
                userid: userid,
                favidlist: [favid],
                favnamelist: [favname]
            });
            
            favorite.save((err2,docsInserted) => {
                if (err2) {
                return res.send(err2);
                }        
                return res.send({message:'ok'});
            });
        }
        else{
            return res.send({message:'ok'});  
        }
      } 
    });
    // if(flag == 1){
    //     Favorite.findOneAndUpdate({ userid : userid},
    //         { $push: { 'favidlist': favid, 'favnamelist': favname}},
    //         { upsert:true, returnNewDocument : true }).exec((err, task)=>{
    //         if (err) {
    //             return res.send(err);
    //         }
    //         else{
    //             Favorite.findOne({ userid: userid})
    //                 .exec((err1, task1) => {
    //                     if (err1) {
    //                         return res.send(err1);
    //                     }
    //                 var favnamelist = task1.favnamelist;
    //                 var favidlist = task1.favidlist;
    //                 var uniqueNames = [];
    //                 var uniqueIDs = [];
    //                 for(var i = 0; i < favnamelist.length; i++){
    //                     if(uniqueNames.indexOf(favnamelist[i]) == -1){
    //                        uniqueNames.push(favnamelist[i]);
    //                        uniqueIDs.push(favidlist[i]); 
    //                     }
    //                 }
    //                 Favorite.findOneAndUpdate({ userid : userid},
    //                     { 'favidlist': uniqueIDs, 'favnamelist': uniqueNames }).exec((err2, task2)=>{
    //                     if (err2) {
    //                         return res.send(err2);
    //                     }
    //                     return res.send({message:'successfully'});
    //                 });
                    
    //             });
    //         }
    //     });  
    // }
    // else{
    //     Favorite.findOne({ userid : userid}).exec((err, task)=>{
    //         if (err) {
    //             return res.send(err);
    //         }
    //         if(!task){
    //             return res.send({msg:0});
    //         }
    //         else{
    //             var favnamelist = task.favnamelist;
    //             var favidlist = task.favidlist;
    //             var uniqueNames = [];
    //             var uniqueIDs = [];
    //             for(var i = 0; i < favnamelist.length; i++){
    //                 if(favname != favnamelist[i]){
    //                     uniqueNames.push(favnamelist[i]);
    //                     uniqueIDs.push(favidlist[i]);
    //                 }
    //             }
    //             Favorite.findOneAndUpdate({ userid : userid},
    //                     { 'favidlist': uniqueIDs, 'favnamelist': uniqueNames }).exec((err2, task2)=>{
    //                     if (err2) {
    //                         return res.send(err2);
    //                     }
    //                     return res.send({message:'successfully'});
    //                 });
    //         }
    //     });  
    // }
    
}

var getfavlist = function (req, res) {
    var userid = req.body.userid;    
    Favorite.find({ userid: userid}).sort({ timestamp: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
      return res.json(task);
    });
}

var saveResultPerContest = function (contestidarray, resarray) {
    
    var contests = [];
    //var endcontests = [];

    Contest.find().sort({ timestamp: -1 })
        .exec((err2, task2) => {
          if (err2) {
            return res.send(err2);
          }
          contests = task2;
          for(var j = 0; j < task2.length; j++){
            var countcheck = 0;
            if(task2[j].endflag == 0){
                for(var k = 0; k < task2[j].checkedgroup.length; k++){
                    var checkedgrouparray = JSON.parse(task2[j].checkedgroup[k]);
                    var count = 0;
                    for(var m = 0; m < checkedgrouparray.length; m++){
                        for(var n = 0; n < task2[j].resultlist.length; n++){
                            var result = JSON.parse(task2[j].resultlist[n]);                        
                            if(checkedgrouparray[m].eventid == result[0].ID){
                                count++;                            
                            }
                        }
                    }
                    if(count == checkedgrouparray.length){
                        countcheck++;                    
                    }
                }
                // if(countcheck == task2[j].checkedgroup.length){
                //     if(task2[j].checkedgroup.length != 0){
                //         endcontests.push(task2[j]._id);
                //     }
                // }
            }
          }

          for(var i = 0; i < contestidarray.length; i++){
                for(var p = 0; p < contests.length; p++){                    
                    if(contests[p]._id.toString() == contestidarray[i].toString()){                        
                        if(contests[p].resultlist.indexOf(resarray[i]) == -1){
                            
                            if(resarray[i] != "[]" && resarray[i] != "" && resarray[i][0] != "<"){                                
                                
                                if(JSON.parse(resarray[i])[0].Final == true){
                                    Contest.findByIdAndUpdate({ '_id': contestidarray[i] }, { $addToSet: { 'resultlist': resarray[i]} }, function (err1, user) {
                                        if (err1) {
                                            return;
                                        }
                                    });   
                                }     
                            }
                                                   
                        }
                    }
                }
            }
            
            // for(var q = 0; q < endcontests.length; q++){        
            //     Contest.findByIdAndUpdate({ '_id': endcontests[q] }, { $set: { endflag: 1 } }, function (err1, user) {
            //         if (err1) {
            //             return;
            //         }
            //     });
            // }
          
        });    
}

var getuserlist = function (req, res) {        
    User.find().sort({ timestamp: -1 })
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }

      Score.find().sort({ timestamp: -1 })
        .exec((err1, task1) => {
          if (err1) {
            return res.send(err1);
          }
          
          return res.json({userlist:task, scorelist:task1});
        });
    });
}

var savecontestfund = function (req, res) {
    var userid = req.body.userid;
    var amount = req.body.amount;
    var contestid = req.body.contestid;
    
    if(amount != 0){
        Contestfund.findOne({ userid: userid, contestid:contestid, joinflag:0}).sort({ timestamp: -1 })
        .exec((err, task) => {
          if (err) {
            return res.send(err);
          }
          
            if(task == null){
                var contestfund = new Contestfund({
                    userid: userid,
                    amount: amount,
                    contestid: contestid,
                    joinflag:0                
                });
                
                contestfund.save((err) => {
                    if (err) {
                        return res.send(err);
                    }
                    return res.send({message:'successfully'});
                });
            }
            else{
                Contestfund.findOneAndUpdate({ userid : req.body.joinuser, contestid: req.body.id},
                            {  $inc: { amount: req.body.game}},
                            { upsert:true, returnNewDocument : false }).exec((err, task)=>{
                            if (err) {
                                return res.send(err);
                            }   
                            return res.send({message:'successfully'});                         
                        });
            }
        });
    }
    
}

var deletefav = function (req, res) {
    var userid = req.body.userid;
    var favid = req.body.favid;   
    Favorite.findOne({ userid: userid}).sort({ timestamp: -1 })
    .exec((err, task) => {
        if (err) {
            return res.send(err);
        }
        
        var favidlist1 = [];
        var favnamelist1 = [];
        for(var i = 0; i < task.favidlist.length; i++){
            if(task.favidlist[i] != favid){
                favidlist1.push(task.favidlist[i]);
                favnamelist1.push(task.favnamelist[i]);
            }
        }        
        Favorite.findOneAndUpdate({ userid : userid},
            { 'favidlist': favidlist1, 'favnamelist': favnamelist1 }).exec((err2, task2)=>{
            if (err2) {
                return res.send(err2);
            }
            return res.send({message:'successfully'});
        });      
    });
}

var addaccount = function (req, res) {

    User.findOneAndUpdate({ _id : req.body.userid},
            { 'account': req.body}).exec((err2, task2)=>{
            if (err2) {
                return res.send({message:'err'});
            }
            return res.send(task2);
        });  
}

var addprofile = function (req, res) {

    User.findOneAndUpdate({ _id : req.body.userid},
            { 'profile': req.body}).exec((err2, task2)=>{
            if (err2) {
                return res.send({message:'err'});
            }
            return res.send(task2);
        });  
}

var getcontesttime = function (req, res) {
    var contestid = req.body.contestid;
    Contest.findOne({_id:contestid})
    .exec((err, task) => {
      if (err) {
        return res.send(err);
      }
      var temptime = null;
      for(var i =0; i < task.checkedgroup.length; i++){
        var tempresulst = JSON.parse(task.checkedgroup[i]);
        for(var j = 0; j < tempresulst.length; j++){
            if(temptime == null || temptime < tempresulst[j].time){
                temptime = tempresulst[j].time;
            }
        }
      }
      return res.send(temptime);
      
    });
}



