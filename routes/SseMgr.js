
// SSE EXTENSION
// https://www.terlici.com/2015/12/04/realtime-node-expressjs-with-sse.html
// http://stackoverflow.com/questions/10700444/running-node-express-server-using-iisnode-eventsource-handlers-not-firing

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config/config.js'); // load configuration data
// var User  = require('../models/user.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var clients = {};
var channels = {};
var subscriptions = {};

var emitterBus = require('../models/emitterModule.js')

emitterBus.eventBus.on('logMessage', function(data) {
  console.log('#SSE#:beep ARRIVED!');
  console.log(data);
  console.log('#SSE#:Write to',data.sseId);

  var msg = {
    msg: data.msg,
    channelId: 'broadcast',
    rnd: Math.random(),
    sseId: data.sseId
  }
  
  if (clients[data.sseId]) {
    clients[data.sseId].write('id: ' + 'logMessage' + '\n');
    clients[data.sseId].write("data: " + JSON.stringify(msg) + "\n\n");
  } else {
    console.log('#SSE#:Write ERROR client not found ID:',data.sseId);
  }

});

channels['CH1'] = { id: 'CH1', desc: 'CH1D'};
channels['CH2'] = { id: 'CH2', desc: 'CH2D'};
channels['CH3'] = { id: 'CH3', desc: 'CH3D'};

// fake middleware
function fetchRoom(req, res, next) {
  // recuper l'id della chiamata ed imposta la room nelle variabili locali alla richiesta per elaborazione successiva
  console.log('#SSE# : MIDDLEWARE fetchRoom: ');
  next();
  // var room = rooms.get(req.params.id);
  // console.log('fetchRoom: ', room );
  /*
  if(room) {
    res.locals.room = room;
    next();
  } else {
    res.status(404).end();
  }
  */
}

module.exports = function(){

    // EventSource link :id (Room/SessionId)
    router.get("/connect/:id/events", fetchRoom, function(req, res) {
      
      var id = req.params.id.toString();
      console.log('#SSE# >/connect/:id/events', id);
    
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      clients[id] = res;

      req.on('close', function(){
        console.log('#SSE# connection closing');
        delete clients[id];
      });

    
      

    });

    // getChannels
    // subChannel/:channelId
    // unsubChannel/:channelId
    // pubChannel/:channelId

    // get all Channels
    router.get("/getChannels", fetchRoom, function(req, res) {
      console.log('#SSE# /getChannels', channels);
      res.status(200).send(channels); 
    });


    // subscribe to channel
    router.get("/subChannel/:channelId/:userId", fetchRoom, function(req, res) {
        var userId = req.params.userId.toString();
        var channelId = req.params.channelId.toString();
        var msg = '';
        console.log('#SSE# /subChannels/:channelId/:userId', channelId, userId);
        if(!subscriptions[channelId]) subscriptions[channelId] = [];
        if(subscriptions[channelId].indexOf(userId) === -1){
          subscriptions[channelId].push(userId);
          msg = {
              action : "subscription ok!",
              userId: userId,
              channelId: channelId
          }

        } else {
          console.log(userId, channelId, 'exist!');
          msg = {
            action : "subscription already exist!",
            userId: userId,
            channelId: channelId
          }
            
        }
        console.log(subscriptions);
        
        res.status(200).send(msg); 
    });

  
    // ussubscribe to channel
    router.get("/unsubChannel/:channelId/:userId", fetchRoom, function(req, res) {
        var userId = req.params.userId.toString();
        var channelId = req.params.channelId.toString();
        var msg = '';
        console.log('#SSE# /unsubChannels/:channelId/:userId', channelId, userId);

        // exist channel ?
        if (subscriptions[channelId]){
          // exist userId ?
          if (subscriptions[channelId].indexOf(userId) === -1){
            console.log('userId not found!');
            msg = {
              action : "unsubscription ERROR! USERID NOT FOUND!",
              userId: userId,
              channelId: channelId
            }

          } else {
            console.log('#SSE# delete ...');
            var arrayId = subscriptions[channelId].indexOf(userId);
            subscriptions[channelId].splice(arrayId);
            msg = {
              action : "unsubscription ok!",
              userId: userId,
              channelId: channelId
            }
          }

        } else {
          console.log('#SSE# channel not found!');
          msg = {
            action : "unsubscription ERROR! CHANNEL NOT FOUND!",
            userId: userId,
            channelId: channelId
          } 
        } 
        
        console.log(subscriptions);
    
        res.status(200).send(msg); 
    });


    // pub to channel
    router.get("/pubChannel/:channelId", fetchRoom, function(req, res) {
        var channelId = req.params.channelId.toString();
        var msg = '';
        console.log('#SSE# /pubChannel/:channelId', channelId);

        // exist subscriptions to channel ?
        if (subscriptions[channelId]){
          // for all users channel publish message
          subscriptions[channelId].forEach(function(userId){
            if (clients[userId]){
              console.log('send message ', channelId, userId);
              var msg = {
                action: 'published!',
                channelId: channelId,
                userId: userId
              }
              clients[userId].write('id: ' + '100' + '\n');
              // res.write("data: " + JSON.stringify(data) + "\n\n");
              clients[userId].write("data: " + JSON.stringify(msg) + "\n\n");
              /*
              clients[userId].write('data: {\n');
              clients[userId].write('data: "msg": "hello world",\n');
              clients[userId].write('data: "channelId": "' + channelId +  '",\n');
              clients[userId].write('data: "userId": "' + userId + '"\n');
              clients[userId].write('data: }\n\n');
              */
            } else {
              console.log(userId, ' NOT FOUND!');    
            }
          });
            msg = {
              action : "pubChannel OK!",
              userId: '',
              channelId: channelId
            }
          
        } else {
            console.log(channelId, ' not found!');
            msg = {
              action : "pubChannel ERROR! CHANNELID NOT FOUND!",
              userId: '',
              channelId: channelId
            }
        }
        console.log(subscriptions);
        res.status(200).send(msg); 
    });



    router.get("/pubBroadcast", function(req, res) {
      // verifica autenticazione
      
      console.log('#SSE# >/broadcast');
      //console.log(clients);

      for (var userId in clients){
          console.log(userId);
          console.log('SEND DATA..................');

          var msg = {
                msg: 'broadcast',
                channelId: 'broadcast',
                userId: userId
          }
        clients[userId].write('id: ' + '999' + '\n');
        clients[userId].write("data: " + JSON.stringify(msg) + "\n\n");

      }

      /*
      clients.forEach(function(element) {
          console.log('SEND DATA..................');
          element.write('id: ' + '100' + '\n');
          element.write('data: ' + 'DATI' + '\n\n');
      });
      */
      res.status(200).send({msg: 'broadcast sent!'});

    });


    // post to channel
    router.post("/post/:channel", fetchRoom, function(req, res) {
      // verifica autenticazione
      
      var channel = request.body.channel;
      console.log('#SSE# >/post/:channel', channel);
      console.log(clients);

      var msg = {
                msg: 'hello!',
                channelId: channelId,
                userId: userId
      }


      clients.forEach(function(element) {
          console.log(element);
          element.write('id: ' + '100' + '\n');
          element.write('data: ' + 'DATI' + '\n\n');
      });

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();      

    });


    // test
    router.get("/test", function(req, res) {
      console.log('#SSE# test');
      // verifica autenticazione
      // sottoscrizione al canale
      res.status(200).send({ok: '100'});
    });


  	return router;
}