import View from './modules/view';
import Setting from './modules/app/setting'

let currentSession,
    currentUser,
    binaryData;

let socket = new WebSocket(`ws://${Setting.host}:${Setting.portWebSocket}`);

// initApp() TODO: initGlobalParam

function setCurrentConnectionData(session, user) { //TODO: Rename
    currentSession = session;
    currentUser = user;
}

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

function getRandomString() {
    return Math.random().toString(36).slice(2);
}

// send message
document.forms.publish.onsubmit = function(e) {
    e.preventDefault();

    let msg = new Msg("message", currentSession , currentUser, this.message.value);
    socket.send(JSON.stringify(msg));

};

socket.onmessage = function(event) {

    let incomingMessage = JSON.parse(event.data);

    switch(incomingMessage.type) {

        case "message":
            View.showMessage(incomingMessage);
            break;

        case "enter-ok":
            setCurrentConnectionData(incomingMessage.session, incomingMessage.user);
            View.loggedApp();
            View.showNotice(incomingMessage.status, incomingMessage.text);
            View.showCurrentUser(incomingMessage.user);
            break;

        case "enter-error":
            View.showNotice(incomingMessage.status, incomingMessage.text);
            let loginForm = document.forms.login;
            loginForm.login.classList.add('validate__error');
            break;

        case "change-users":
            View.showUserOnline(incomingMessage.users);
            break;

        case "notify":
            View.showNotice(incomingMessage.status, incomingMessage.text);
            break;

        case "change-photo":

            if (currentUser.login == incomingMessage.user.login) {
                 View.showNotice(incomingMessage.status, incomingMessage.text);
            }
            View.removeUploadPhotoForm();
            updatePhoto(incomingMessage.user);
            break;
    }

};

function updatePhoto(user) {

    let url;
    let photos = document.querySelectorAll('.photo__link');

    for (let i = photos.length - 1; i>= 0 ; i --) {
        let photo = photos[i];

        if (photo.getAttribute('login') === user.login) {

            url = `http://${Setting.host}:${Setting.portMedia}/photos/${user.login}.jpg?${getRandomString()}`;
            photo.src = url;
       }
    }

    if (currentUser.login == user.login) {
        currentUser.photo = url;
    }

}

function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleFileSelect(e) {

    e.stopPropagation();
    e.preventDefault();


    let files = e.dataTransfer.files;

    if (files[0]) {
        let f = files[0];

        if (f.type != 'image/jpeg') {
            View.showNotice('danger','Not supported format file.Select jpeg!');
            return false;
        }

        if (f.size > Setting.limit * 1024) {
            View.showNotice('danger','You have exceeded the file size should not exceed 512 Kb');
            return false;
        }

        let reader = new FileReader();

        reader.onload = function(e) {

           View.setPhotoBackground(e.target.result);
           binaryData = e.target.result; //global

        };
        reader.readAsDataURL(f);
    }
}

function showUploadPhotoForm() {

    let modalPhoto = document.getElementById('modalPhoto');

    if (!modalPhoto) {

        View.showUploadForm();

        let wrapper = document.querySelector('.wrapper');
        wrapper.classList.add('background__opacity');

        let dropAria = document.getElementById('dropAria');

        dropAria.addEventListener('dragover', handleDragOver);
		dropAria.addEventListener('drop', handleFileSelect);

        let uploadPhotoBth = document.getElementById('uploadPhoto');

        uploadPhotoBth.onclick = (e) => {
            e.preventDefault();
            console.log('upload');
            let msg = new Msg("upload", currentSession , currentUser);
            msg.file = binaryData;  //global
            socket.send(JSON.stringify(msg));
            binaryData = '';
        }
    }
}


new Promise(function(resolve, reject) {

    if (!window.WebSocket) {
        let error = 'WebSocket not support';
        View.showNotice('danger', error);
        reject(new Error(error))
    } else {
        window.onload = resolve;
    }

}).then(function() {

    View.showLoginForm();

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
            View.showNotice('danger', 'Enter the user name and login');
            fieldUserName.classList.add('validate__error');
            fieldLogin.classList.add('validate__error');
        }
    };

}).then(() => {

    document.onclick = (e) => {
        if (e.target.id == 'changeAvatar') {
            e.preventDefault();
            showUploadPhotoForm();
        }
        if (e.target.id == 'closeUploadForm') {
            e.preventDefault();
            View.removeUploadPhotoForm();
        }

    }

}).catch(function(e) {
    console.error(e);
    alert('Error: ' + e.message);
});
