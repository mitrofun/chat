'use strict';

let http = require('http');
let Static = require('node-static');
let WebSocketServer = new require('ws');

let users = [];
let messages = [];
let connection = [];
let clients = {};

let webSocketServer = new WebSocketServer.Server({
  port: 8081
});

webSocketServer.on('connection', function(ws) {

    connection.push(ws);
    
    ws.on('test', function (val) {
        console.log(val);
    });

    let id = Math.random();
    clients[id] = ws;

    console.log("new connection " + id);

    ws.on('message', function(message) {
        
        console.log(message.data);
        
        console.log('add message ' + message);

        let msg = JSON.parse(message);

        switch(msg.type) {

            case "login":
                console.log(msg);
                break;

            case "message":
                for (let key in clients) {
                    clients[key].send(message);
                }
                break;
        }

    });

    ws.on('close', function() {
        console.log('connection close ' + id);
        delete clients[id];
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

