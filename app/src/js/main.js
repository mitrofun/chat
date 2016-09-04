import messageTemplate from '../hbs/main/message.hbs';
import loginTemplate from '../hbs/modal/login.hbs';
import sidebarUserTemplate from '../hbs/sidebar/user.hbs';
import sidebarOnlineUsersTemplate from '../hbs/sidebar/online.hbs';
import noticeTemplate from '../hbs/modal/notice.hbs';
import uploadTemplate from '../hbs/modal/upload.hbs';

let currentSession,
    currentUser,
    binaryData,
    counterLoadPhoto = 0;

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

        case "change-photo":

            if (currentUser.login == incomingMessage.user.login) {
                 showNotice(incomingMessage.status, incomingMessage.text);
            }
            removeUploadPhotoForm();
            updatePhoto(incomingMessage.user,counterLoadPhoto ++);
            break;
    }

};

function updatePhoto(user, counter) {
    let photos = document.querySelectorAll('.photo__link');

    for (let i = photos.length - 1; i>= 0 ; i --) {
        let photo = photos[i];

        if (photo.getAttribute('login') === user.login) {
            console.log(photo);
            photo.src = `http://localhost:8000/photos/${user.login}.jpg?${counter}`;
       }
    }

}

function showMessage(message) {

    // console.log(message);

    document.querySelector('.messages').insertAdjacentHTML('beforeend', messageTemplate({
        username: message.user.name,
        login: message.user.login,
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
        login: user.login,
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

function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function setPhotoBackground(binData) {
    let dropAria = document.getElementById('dropAria');
    dropAria.style.backgroundImage = `url(${binData})`;
    dropAria.innerText = '';
    binaryData = binData;
}

function handleFileSelect(e) {

    e.stopPropagation();
    e.preventDefault();


    let files = e.dataTransfer.files;

    // console.log(files);

    if (files[0]) {
        let f = files[0];

        if (f.type != 'image/jpeg') {
            showNotice('danger','Not supported format file.Select jpeg!');
            return false;
        }

        if (f.size > 512 * 1024) {
            showNotice('danger','You have exceeded the file size should not exceed 512 Kb');
            return false;
        }

        let reader = new FileReader();

        reader.onload = function(e) {

           setPhotoBackground(e.target.result);

        };
        reader.readAsDataURL(f);
    }
}

function showUploadPhotoForm() {
    let modalPhoto = document.getElementById('modalPhoto');

    if (!modalPhoto) {
          document.body.insertAdjacentHTML('afterbegin', uploadTemplate());
        let wrapper = document.querySelector('.wrapper');
        wrapper.classList.add('background__opacity');

        let dropAria = document.getElementById('dropAria');
        dropAria.addEventListener('dragover', handleDragOver);
		dropAria.addEventListener('drop', handleFileSelect);

        let uploadPhotoBth = document.getElementById('uploadPhoto');

        uploadPhotoBth.onclick = (e) => {
            e.preventDefault();
            console.log('upload');
            console.log(currentUser);
            console.log(currentSession);
            let msg = new Msg("upload", currentSession , currentUser);
            msg.file = binaryData;
            socket.send(JSON.stringify(msg));
        }
    }
}

function removeUploadPhotoForm() {

    let modalPhoto = document.getElementById('modalPhoto');

    if (modalPhoto) {
        let wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('background__opacity');
        modalPhoto.remove();
    }

}


new Promise(function(resolve, reject) {

    if (!window.WebSocket) {
        let error = 'WebSocket not support';
        showNotice('danger', error);
        reject(new Error(error))
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

}).then(() => {

    document.onclick = (e) => {
        if (e.target.id == 'changeAvatar') {
            e.preventDefault();
            showUploadPhotoForm();
        }
        if (e.target.id == 'closeUploadForm') {
            e.preventDefault();
            removeUploadPhotoForm();
        }

    }

}).catch(function(e) {
    console.error(e);
    alert('Error: ' + e.message);
});
