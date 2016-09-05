import Setting from './modules/app/setting'
import Route from './modules/router'
import { Msg } from './modules/model/message'

let currentSession,
    currentUser;

let socket = new WebSocket(`ws://${Setting.host}:${Setting.portWebSocket}`);

function initAppData(session, user) {
    currentSession = session;
    currentUser = user;
}

document.forms.publish.onsubmit = function(e) {
    e.preventDefault();

    let msg = new Msg("message", currentSession , currentUser, this.message.value);
    socket.send(JSON.stringify(msg));

};

socket.onmessage = function(event) {

    let incomingMessage = JSON.parse(event.data);

    switch(incomingMessage.type) {

        case "message":
            Route.handle('showMessage', incomingMessage);
            break;

        case "enter-ok":

            initAppData(incomingMessage.session, incomingMessage.user);

            Route.handle('loginToApp', incomingMessage.user);
            Route.handle('showNotice', incomingMessage.status, incomingMessage.text);
            Route.handle('uploadPhoto', socket, currentSession, currentUser);
            break;

        case "enter-error":

            let loginForm = document.forms.login;
            loginForm.login.classList.add('validate__error');

            Route.handle('showNotice', incomingMessage.status, incomingMessage.text);
            break;

        case "change-users":

            Route.handle('updateUsers', incomingMessage.users);
            break;

        case "notify":

            Route.handle('showNotice', incomingMessage.status, incomingMessage.text);
            break;

        case "change-photo":

            if (currentUser.login === incomingMessage.user.login) {
                 Route.handle('showNotice', incomingMessage.status, incomingMessage.text);
            }
            Route.handle('updatePhoto',incomingMessage.user, currentUser);
            break;
    }

};


new Promise(function(resolve, reject) {

    if (!window.WebSocket) {

        let error = 'WebSocket not support';
        Route.handle('showNotice', 'danger', error);
        reject(new Error(error))

    } else {
        window.onload = resolve;
    }

}).then(() => {

    Route.handle('login', socket);

}).catch(function(e) {
    console.error(e);
    alert('Error: ' + e.message);
});
