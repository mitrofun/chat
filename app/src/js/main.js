import messageTemplate from '../hbs/message.hbs';
import loginTemplate from '../hbs/login.hbs';
import sidebarUserTemplate from '../hbs/sidebar/user.hbs';
import sidebarOnlineUsersTemplate from '../hbs/sidebar/online.hbs';
import noticeTemplate from '../hbs/notice.hbs';

let currentSession,
    currentUser;

function User(name, login) {
    this.name = name;
    this.login = login;
    this.photo = getPhoto();

    function getPhoto() {

    }

    function setPhoto() {

    }
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

    socket.send(JSON.stringify(msg));
    return false;
};


socket.onmessage = function(event) {

    let incomingMessage = JSON.parse(event.data);

    // console.log('incomingMessage.type', incomingMessage.type);

    switch(incomingMessage.type) {

        case "message":
            showMessage(incomingMessage);
            break;

        case "enter-ok":
            setCurrentConnectionData(incomingMessage.session, incomingMessage.user);
            loginApp();
            showNotice(incomingMessage.status, incomingMessage.text);
            showCurrentUser(incomingMessage.user);
            break;

        case "enter-error":
            showNotice(incomingMessage.status, incomingMessage.text);
            let loginForm = document.forms.login;
            loginForm.login.classList.add('validate__error');
            break;

        case "change-users":
            showUserOnline(incomingMessage.users);
            break;

        case "notify":
            showNotice(incomingMessage.status, incomingMessage.text);
            break;
    }

};

function showMessage(message) {

    console.log(message);

    document.querySelector('.messages').insertAdjacentHTML('beforeend', messageTemplate({
        username: message.user.login,
        photo: message.user.photo,
        datetime: message.datetime,
        message: message.text
    }));
    
    document.forms.publish.message.value = '';
    messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
}

function showCurrentUser(user) {

    let sidebar = document.querySelector('.sidebar');
    sidebar.insertAdjacentHTML('afterbegin', sidebarUserTemplate({
        name: user.name,
        photo: user.photo
    }));
}

function showUserOnline(users) {
    let usersOnline = document.querySelector('.users');

    usersOnline.innerHTML = sidebarOnlineUsersTemplate({
        users: users,
        count: users.length
    });
}

function showNotice(status, text) {

    document.body.insertAdjacentHTML('afterbegin', noticeTemplate({
        status: status,
        text: text
    }));

    setTimeout(()=>{
        document.querySelector('.notice').remove()
    }, 2000);
}


new Promise(function(resolve, reject) {
    if (!window.WebSocket) {
        reject(new Error("WebSocket not support"))
    } else {
        window.onload = resolve;
    }
}).then(function() {

    document.body.insertAdjacentHTML('afterbegin', loginTemplate());

    let loginForm = document.forms.login;

    loginForm.onsubmit = function (e) {
        console.log('login');
        e.preventDefault();

        let fieldUserName = loginForm.name;
        let fieldLogin = loginForm.login;

        let user = new User(fieldUserName.value, fieldLogin.value);
        let msg = new Msg("login", currentSession, user);

        if (fieldUserName.value.length !== 0 && fieldLogin.value.length !== 0) {
            socket.send(JSON.stringify(msg));
        } else {
            showNotice('danger', 'Enter the user name and login');
            fieldUserName.classList.add('validate__error');
            fieldLogin.classList.add('validate__error');
        }
    };

}).catch(function(e) {
    console.error(e);
    alert('Ошибка: ' + e.message);
});
