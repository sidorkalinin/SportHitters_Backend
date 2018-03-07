'use strict';

// dependencies
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const path = require('path');

// create an instance of express
const app = express();

// configure body-parser to accept
// urlencoded bodies and json data
app.use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json());

//  to allow all cors origin
app.use(cors())

// connection to the database
require('./server/configs/database');

//serving index.html from dist
app.use(express.static(path.join(__dirname, 'dist')));

// route registration
app.use('/api', require('./server/routes'));

// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

// error handling

// 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// 500 errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

////////////////////////////cron///////////////////////////

var cron = require('node-cron');
var auth1 = require('./server/controllers/auth');

cron.schedule('*/2 * * * *', function(){
  auth1.calculateContestResult();
});

///////////////////////////////////////////////////////////
////////////////////////chat///////////////////////////////

let app1 = require('express')();
let http = require('http').Server(app1);
let io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('disconnect', function(){
    auth1.delSocketId(socket.id);
    io.emit('disconnect-user',{socketId: socket.id});
    io.emit('users-changed', {user: socket.nickname, event: 'left'});
  });

  socket.on('set-nickname', (nickname) => {
    socket.nickname = nickname.gameid;
    io.emit('users-changed', {user: nickname.username, gameid:nickname.gameid,event: 'joined'});
  });

  socket.on('add-message', (message) => {
    io.emit('message', {text: message.text, from: message.name, userid: message.userid, gameid:message.gameid, created: new Date()});
  });

  socket.on('authentication',(message1) => {
    auth1.addSocketId(message1.userid, socket.id);
    io.emit('connect-user', { userid:message1.userid, socketId:socket.id });
  });

  // socket.on('sign-out',(data)=>{
  //   console.log(data);
  //   var socketId = auth1.setLogout(data.userid);
  //   console.log("sign-out        "+data.userid);
  //   io.emit('disconnect-user-id',{userid: data.userid});
  // })
});

var port1 = process.env.PORT || 3001;

http.listen(port1, function(){
   console.log('listening in http://localhost:' + port1);
});

////////////////////////////////////////////////////////////

// set the port to use
const port = parseInt(process.env.PORT, 10) || 3000;

// start the server
const server = app.listen(port, () => {
  console.log(`App is running at: localhost:${server.address().port}`);
});
