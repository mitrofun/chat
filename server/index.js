'use strict';

let http = require('http');
let Static = require('node-static');
let WebSocketServer = new require('ws');
let fs = require('fs');
const path = require('path');

let users = {};
let messages = [];
let clients = {};
let loginClients = {};

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

function User(name, login, photo='http://localhost:8000/no-photo.jpg') {
    this.name = name;
    this.login = login;
    this.photo = photo;

    function getPhoto() {
        return false;
    }

    function setPhoto() {

    }
}

function addLoggedUser(user, socket, id) {
    users[user.login] = user;
    socket.user = user.login;
    loginClients[id] = socket;
}

function removeLogoutUser(user, id) {
    delete users[user];
    delete clients[id];
    delete loginClients[id];
}

function sendMessage(socket, message) {
    if (typeof message === 'string') {
        socket.send(message);
    } else {
        socket.send(JSON.stringify(message));
    }
}


function loginUser(user, sessionId, socket) {
    let msg;
    let result = false;

    if (!(user.login in users)) {
        result = new User(user.name, user.login);

        if (result.getPhoto()) {
            result.setPhoto()
        }

        addLoggedUser(result, socket, sessionId);
        msg = new Msg('enter-ok', sessionId, result, `Hi, ${user.name}!`);

    } else {
        msg = new Msg('enter-error', sessionId, false, `current user is already in chat!`);
    }
    sendMessage(socket, msg);
    return result;
}

function addMessage(message) {
    messages.push(message);
}

function sendArchiveMessages(socket) {

    messages.forEach((message) => {
        sendMessage(socket, message)
    })

}

webSocketServer.on('connection', function(ws) {

    let id = Math.random();
    clients[id] = ws;

    console.log("new connection with id = " + id);

    ws.on('message', function(message) {
        
        console.log('add message ' + message);

        let msg = JSON.parse(message);

        switch(msg.type) {

            // login
            case "login":

                if (loginUser(msg.user, id, clients[id])) {
                     // get photo
                    
                    sendArchiveMessages(clients[id]);
                }
                break;

            // send message
            case "message":

                for (let key in loginClients) {
                    loginClients[key].send(message);
                }
                addMessage(message);
                break;
        }

    });

    ws.on('close', function() {
        console.log('connection close ' + id);
        removeLogoutUser( ws.user, id);
    });

});

// severs

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

////PHOTOS

let currentDir = path.dirname(fs.realpathSync(__filename));
let photoDir = `${currentDir}/media/photos`;

console.log(photoDir);

function fsExistsSync(file) {
    try {
        fs.accessSync(file);
        return true
    } catch (e) {
        return false
    }
}

if (fsExistsSync(`${photoDir}/mitri4.jpeg`)) {
    console.log('COOOL')
} else {
    console.log('NotCOOOL')
}
