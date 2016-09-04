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

function User(name, login) {
    this.name = name;
    this.login = login;
    this.photo = getPhoto(this.login);

    function getPhoto(name) {

        let currentDir = path.dirname(fs.realpathSync(__filename));
        let photoDir = `${currentDir}/media/photos`;

        function fsExistsSync(file) {
            try {
                fs.accessSync(file);
                return true
            } catch (e) {
                return false
            }
        }

        if (fsExistsSync(`${photoDir}/${name}.jpg`)) {
            return `http://localhost:8000/photos/${name}.jpg`
        } else {
            return 'http://localhost:8000/no-photo.jpg'
        }
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
        addLoggedUser(result, socket, sessionId);
        msg = new Msg('enter-ok', sessionId, result, `Hi, ${user.name}!`);
        msg.status = 'success';
    } else {
        msg = new Msg('enter-error', sessionId, false, `Current user is already in chat!`);
        msg.status = 'danger';
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

function sendUsersStatus(socket) {
    let usersArray = [];
    let msg = new Msg('change-users', 0, {}, '');

    for (let user in users) {
        usersArray.push(users[user].name)
    }

    msg.users = usersArray;
    
    sendMessage(socket, msg)
}

function sendAllUsersConnectStatus(users) {
    for (let key in users) {
        sendUsersStatus(users[key])
    }
}

function notifyAllUsers(user, status, text, id) {
    
    let notice = new Msg('notify', 0, {}, `${user} ${text}!`);
        notice.status = status;

        for (let key in loginClients) {
            if (id != key) {
                sendMessage(loginClients[key], notice);
            }
        }
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
                    notifyAllUsers(msg.user.login,'warning', 'joined the chat', id);
                    sendArchiveMessages(clients[id]);
                    sendAllUsersConnectStatus(loginClients)
                }

                break;

            // send message
            case "message":

                for (let key in loginClients) {
                    sendMessage(loginClients[key], message);
                }
                addMessage(message);

                break;
        }

    });

    ws.on('close', function() {
        console.log('connection close ' + id);

        let leftUser = ws.user;
        removeLogoutUser(leftUser, id);
        notifyAllUsers(leftUser, 'warning', 'left the chat');
        sendAllUsersConnectStatus(loginClients);
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

