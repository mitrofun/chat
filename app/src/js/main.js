import template from '../hbs/message.hbs';

let msg = {
    type: "",
    user : {
        name: "",
        login: ""
    },
    text: "",
    id:   "",
    date: "",
    error: ""
};

let user = {
    name: "",
    login: ""
};

let messagesList = document.querySelector('.messages');

if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket not support';
}

let socket = new WebSocket("ws://localhost:8081");

// send message
document.forms.publish.onsubmit = function() {

    msg = {
        type: "message",
        text: this.message.value,
        date: new Date(),
        user: user
    };
    
    socket.send(JSON.stringify(msg));
    return false;
};


document.forms.login.onsubmit = function (e) {

    console.log('login');
    e.preventDefault();

    let loginForm = document.forms.login;

    msg = {
        type: "login",
        user: {
            name: loginForm.name.value,
            login: loginForm.login.value
        },
        date: new Date()
    };

    console.log(msg);

    socket.send(JSON.stringify(msg));

    // if good

    user = {
        name: loginForm.name.value,
        login: loginForm.login.value
    };

    let loginWrapper = document.querySelector('.login');
    let appWrapper = document.querySelector('.wrapper');

    loginWrapper.classList.add('is_hide');
    appWrapper.classList.remove('is_hide');
    //
};

socket.onmessage = function(event) {

    let incomingMessage = JSON.parse(event.data);

    console.log('incomingMessage.type', incomingMessage.type);

    switch(incomingMessage.type) {
        case "message":
            showMessage(incomingMessage);
            break;
    }

};

function showMessage(message) {

    console.log(message);

    document.querySelector('.messages').insertAdjacentHTML('beforeend', template({
        username: message.user.login,
        datetime: message.date,
        message: message.text
    }));
    
    document.forms.publish.message.value = '';

    messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
}
