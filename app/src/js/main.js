import template from '../hbs/message.hbs';

let messagesList = document.querySelector('.messages');

if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket not support';
}

let socket = new WebSocket("ws://localhost:8081");

document.forms.publish.onsubmit = function() {
    let outgoingMessage = this.message.value;
    
    socket.send(outgoingMessage);
    return false;
};

socket.onmessage = function(event) {
    let incomingMessage = event.data;
    showMessage(incomingMessage); 
};

function showMessage(message) {
    
    document.querySelector('.messages').insertAdjacentHTML('beforeend', template({
        username: "mitri4",
        datetime: new Date().toLocaleString(),
        message: message
    }));
    
    document.forms.publish.message.value = '';

    messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
}
