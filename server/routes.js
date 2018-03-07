const express = require('express');
var auth = require('./controllers/auth');
var fav = require('./controllers/favourite');
var todo = require('./controllers/todo')
const router = express.Router();
var JWT = require('jwt-simple');
const config = require('./configs/config')
const User = require('./models/user');

var nodemailer = require('nodemailer');


/* GET api listing. */
router.get('/', (req, res) => {
  return res.send('api works');
});

router.post('/auth/login', (req, res) => { 
	auth.login(req, res) 
});

router.post('/auth/signup', (req, res) => { auth.signup(req, res) });
router.post('/auth/activesignup', (req, res) => { auth.activesignup(req, res) });

router.post('/auth/sendmail', (req, res) => { 
	auth.sendmail(req, res) 
});

router.post('/auth/change-password', (req, res) => {
  // checkJWT(req, res, (jwtValid) => {
  //   if (jwtValid) { auth.changePassword(req, res) }
  // })
  auth.changePassword(req, res);
});

router.get('/auth/users', (req, res) => {
    auth.allUsers(req, res)
});

router.post('/fav/change-fav-status', (req, res) => {
  checkJWT(req, res, (jwtValid) => {
    if (jwtValid) { fav.ChangeFavStatus(req, res) }
  })
});

router.get('/fav/user', (req, res) => {
  checkJWT(req, res, (jwtValid) => {
    if (jwtValid) { fav.favUser(req, res) }
  })
});

router.post('/contest/register', (req, res) => {
  auth.registercontest(req, res);
});

router.post('/contest/checkjoinuser', (req, res) => {
  auth.checkjoinuser(req, res);
});

router.get('/contest/getallcontest/:id', (req, res) => {
  auth.getallcontest(req, res);  
});

router.get('/contest/getcontestbyid:contestid', (req, res) => {
  auth.getcontestbyid(req, res);
});

router.get('/contest/getcontestinfobyid:contestid', (req, res) => {
  auth.getcontestinfobyid(req, res);
});

router.post('/contest/getbysport', (req, res) => {
  auth.getbysportcontest(req, res);
});

router.get('/contest/getresultbysport/:sport', (req, res) => {
  auth.getresultbysport(req, res);
});

router.post('/contest/joinbysport', (req, res) => {
  auth.joinbysportcontest(req, res);
});
router.post('/contest/getprevoptionlist', (req, res) => {
  auth.getprevoptionlist(req, res);
});

router.get('/odds/getsports', (req, res) => {  
  auth.oddsgetsports(req, res);
});

router.get('/odds/getsportstypegame:id', (req, res) => {  
  auth.oddsgetsportstypegame(req, res);
});

router.get('/odds/getodds:id', (req, res) => {  
  auth.oddsgetodds(req, res);
});

router.post('/chat/savechat', (req, res) => {
  auth.savechat(req, res);
});

router.post('/score/addscore', (req, res) => {
  auth.addscore(req, res);
});

router.post('/chat/getprevchat', (req, res) => {
  auth.getprevchat(req, res);
});

//Jami
router.post('/chat/getUnreadMessage', (req, res) => {
  auth.getUnreadMessage(req, res);
});

router.post('/fav/addfav', (req, res) => {
  auth.addfav(req, res);
});

router.post('/fav/getfavlist', (req, res) => {
  auth.getfavlist(req, res);
});

router.post('/fav/deletefav', (req, res) => {
  auth.deletefav(req, res);
});

router.post('/fav/addupgrade', (req, res) => {
  auth.addupgrade(req, res);
});

router.post('/fav/getallchatbyuser', (req, res) => {
  auth.getallchatbyuser(req, res);
});

router.post('/fund/getfundinfo', (req, res) => {
  auth.getfundinfo(req, res);
});
router.post('/fund/postpay', (req, res) => {
  auth.postpay(req, res);
});
router.post('/fund/postpayprev', (req, res) => {
  auth.postpayprev(req, res);
});
router.post('/fund/postwithdraw', (req, res) => {
  auth.postwithdraw(req, res);
});
router.post('/contestfund/save', (req, res) => {
  auth.savecontestfund(req, res);
});
router.post('/contest/getcontesttime', (req, res) => {
  auth.getcontesttime(req, res);
});

router.post('/user/addaccount', (req, res) => {
  auth.addaccount(req, res);
});

router.post('/user/addprofile', (req, res) => {
  auth.addprofile(req, res);
});

router.post('/user/setLogin', (req, res) => {
  auth.setLogin(req, res);
});

router.post('/user/setLogout', (req, res) => {
  auth.setLogout(req, res);
});

router.get('/fav/getuserlist', (req, res) => { auth.getuserlist(req, res); });

router.post('/auth/logout', (req, res) => { res.send('under dovelopment') });
router.get('/auth/user', (req, res) => { res.send('under dovelopment') });
router.delete('/auth/delete', (req, res) => { res.send('under dovelopment') });

router.get('/todo/tasks/:id', (req, res) => { todo.getTasks(req, res) });
router.post('/todo/task', (req, res) => { todo.postTask(req, res) });
router.get('/todo/task/:id', (req, res) => { todo.getTask(req, res) });
router.put('/todo/task/:id', (req, res) => { todo.updateTask(req, res) });
router.delete('/todo/task/:id', (req, res) => { todo.deleteTask(req, res) });

module.exports = router;

////////local////functions////////////
var checkJWT = exports.checkJWT = function (req, res, cb) {
  if (req.body.JWT) {
    console.log(JWT.decode(req.body.JWT, config.secretKeyJWT))
    var data = JWT.decode(req.body.JWT, config.secretKeyJWT)
    User.findById({ '_id': data._id }, function (err, user) {
      var activeTime = new Date(user.last_active);
      var timeLimit = new Date(activeTime);
      timeLimit = activeTime.setHours(activeTime.getHours() + 1)
      // console.log(new Date(timeLimit));
      currentTime = new Date();
      // console.log(new Date(timeLimit) > currentTime)
      var diff = new Date(timeLimit) - currentTime;
      console.log(Math.floor(diff / 1e3), 'Remaining session seconds')
      if (diff > 1e3) {
        User.findByIdAndUpdate({ '_id': data._id }, { $set: { last_active: new Date() } }, function (err, user) {
          cb(true)
          return
        });
      } else {
        cb(false)
        return res.json({ status: false, message: 'Invalid request! , Authentication fail' });
      }
    });

  } else if (req.query.JWT) {
    console.log("asdasd", JWT.decode(req.query.JWT, config.secretKeyJWT))
    var data = JWT.decode(req.query.JWT, config.secretKeyJWT)
    User.findById({ '_id': data._id }, function (err, user) {
      var activeTime = new Date(user.last_active);
      var timeLimit = new Date(activeTime);
      timeLimit = activeTime.setHours(activeTime.getHours() + 1)
      // console.log(new Date(timeLimit));
      currentTime = new Date();
      // console.log(new Date(timeLimit) > currentTime)
      var diff = new Date(timeLimit) - currentTime;
      console.log(Math.floor(diff / 1e3), 'Remaining session seconds')
      if (diff > 1e3) {
        User.findByIdAndUpdate({ '_id': data._id }, { $set: { last_active: new Date() } }, function (err, user) {
          cb(true)
          return
        });
      } else {
        cb(false)
        return res.json({ status: false, message: 'Invalid request! , Authentication fail' });
      }
    });

  }
  else {
    cb(false);
    return res.json({ status: false, message: 'Invalid request! , Authentication fail' });
  }
}
////////local////functions////////////

