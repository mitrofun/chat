import messageTemplate from '../hbs/message.hbs';
import loginTemplate from '../hbs/login.hbs';

let currentSession,
    currentUser;

function User(name, login) {
    this.name = name;
    this.login = login;
}

function Msg(type, session, user, text='') {
    this.type = type;
    this.session = session;
    this.user = user;
    this.text = text;
    this.datetime = new Date();
}


let messagesList = document.querySelector('.messages');

let socket = new WebSocket("ws://localhost:8081");

function loginApp() {
    let loginWrapper = document.querySelector('.login');
    let appWrapper = document.querySelector('.wrapper');

    loginWrapper.remove();
    appWrapper.classList.remove('is_hide');
}

function setCurrentConnectionData(session, user) {
    currentSession = session;
    currentUser = user;
}

// send message
document.forms.publish.onsubmit = function() {

    let msg = new Msg("message", currentSession , currentUser, this.message.value);

    //validation form HERE 
    //
    
    socket.send(JSON.stringify(msg));
    return false;
};


socket.onmessage = function(event) {

    let incomingMessage = JSON.parse(event.data);

    console.log('incomingMessage.type', incomingMessage.type);

    switch(incomingMessage.type) {

        case "message":
            showMessage(incomingMessage);
            break;

        case "enter-ok":
            setCurrentConnectionData(incomingMessage.session, incomingMessage.user);
            loginApp();
            
            // input all message
            
            break;

        case "enter-error":
            // show message
            break;
    }

};

function showMessage(message) {

    document.querySelector('.messages').insertAdjacentHTML('beforeend', messageTemplate({
        username: message.user.login,
        datetime: message.datetime,
        message: message.text
    }));
    
    document.forms.publish.message.value = '';
    messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
}


new Promise(function(resolve, reject) {
    if (!window.WebSocket) {
        reject(new Error("WebSocket not support"))
    } else {
        window.onload = resolve;
    }
}).then(function() {

    document.body.insertAdjacentHTML('afterbegin', loginTemplate());

    //login

    let loginForm = document.forms.login;

    loginForm.onsubmit = function (e) {
        console.log('login');
        e.preventDefault();

        let user = new User(loginForm.name.value,loginForm.login.value);
        let msg = new Msg("login", currentSession, user);

        // send query for authorization
        socket.send(JSON.stringify(msg));
    };

}).catch(function(e) {
    console.error(e);
    alert('Ошибка: ' + e.message);
});
