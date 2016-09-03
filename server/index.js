'use strict';

let http = require('http');
let Static = require('node-static');
let WebSocketServer = new require('ws');

let users = {};
let messages = [];
// let connection = [];
let clients = {};

let webSocketServer = new WebSocketServer.Server({
  port: 8081
});

function Msg(type, session, user, text ) {
    this.type = type;
    this.session = session;
    this.user = user;
    this.text = text;
    this.datetime = new Date();
}

function addLoggedUser(user, socket) {
    users[user.login] = user;
    socket.user = user.login;
}

function sendMessage(socket, message) {
    socket.send(JSON.stringify(message));
}


function loginUser(user, sessionId, socket) {
    let msg;

    if (!(user.login in users)) {

        addLoggedUser(user, socket);
        msg = new Msg('enter-ok', sessionId, user, `Hi, ${user.name}!`);

    } else {
        msg = new Msg('enter-error', sessionId, false, `current user is already in chat!`);
    }
    sendMessage(socket, msg);
}

function addMessage(message) {
    messages.push(message);
}

webSocketServer.on('connection', function(ws) {

    // connection.push(ws);
    let id = Math.random();
    clients[id] = ws;

    console.log("new connection with id = " + id);

    ws.on('message', function(message) {
        
        console.log('add message ' + message);

        let msg = JSON.parse(message);

        switch(msg.type) {

            // login
            case "login":

                loginUser(msg.user, id, clients[id]);
                // get photo
                break;

            // send message
            case "message":

                for (let key in clients) {
                    clients[key].send(message);
                }
                addMessage(message);
                break;
        }

    });

    ws.on('close', function() {

        console.log('connection close ' + id);

        delete users[ws.user];
        delete clients[id];
        // console.log(connection);
    });

});


let appServer = new Static.Server('../app/dist');
let mediaServer = new Static.Server('./media');

http.createServer(function (req, res) {

  appServer.serve(req, res);

}).listen(8080);

http.createServer(function (req, res) {

  mediaServer.serve(req, res);

}).listen(8000);

console.log("ws server start on localhost port: 8081");
console.log("media server start on http://127.0.0.1:8000");
console.log("http server for app client start on http://127.0.0.1:8080");