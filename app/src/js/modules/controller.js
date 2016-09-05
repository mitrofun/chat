'use strict';

import Setting from './app/setting'
import View from './view';
import { User } from './model/user';
import { Msg } from './model/message';
import { getRandomString } from './extra'

let binaryData;

function __handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function __handleFileSelect(e) {

    e.stopPropagation();
    e.preventDefault();


    let files = e.dataTransfer.files;

    if (files[0]) {
        let text;
        let f = files[0];
        let status = 'danger';

        if (f.type != 'image/jpeg') {
            text = 'Not supported format file.Select jpeg!';
            View.showNotice(status, text);
            return false;
        }

        if (f.size > Setting.limit * 1024) {
            text = 'You have exceeded the file size should not exceed 512 Kb';
            View.showNotice(status, text);
            return false;
        }

        let reader = new FileReader();

        reader.onload = function(e) {
            View.setPhotoBackground(e.target.result);
            
            binaryData = e.target.result; 
        };
        reader.readAsDataURL(f);
    }
}

function __showUploadPhotoForm(socket, session, user) {

        // console.log(socket, session, user);

        let modalPhoto = document.getElementById('modalPhoto');

        if (!modalPhoto) {

            View.showUploadForm();

            let wrapper = document.querySelector('.wrapper');
            wrapper.classList.add('background__opacity');

            let dropAria = document.getElementById('dropAria');

            dropAria.addEventListener('dragover', __handleDragOver);
            dropAria.addEventListener('drop', __handleFileSelect);

            let uploadPhotoBth = document.getElementById('uploadPhoto');

            uploadPhotoBth.onclick = (e) => {
                e.preventDefault();
                console.log('upload');
                let msg = new Msg("upload", session , user);
                msg.file = binaryData; 
                socket.send(JSON.stringify(msg));
                binaryData = '';
            }
        }
}

export default {

    loginRoute(args) {
        
        View.showLoginForm();

        let socket = args[0];
        let loginForm = document.forms.login;

        loginForm.onsubmit = function (e) {

            console.log('login');
            e.preventDefault();

            let fieldUserName = loginForm.name;
            let fieldLogin = loginForm.login;

            let user = new User(fieldUserName.value, fieldLogin.value);
            let msg = new Msg("login", 0, user);

            if (fieldUserName.value.length !== 0 && fieldLogin.value.length !== 0) {
                socket.send(JSON.stringify(msg));
            } else {

                View.showNotice('danger', 'Enter the user name and login');

                fieldUserName.classList.add('validate__error');
                fieldLogin.classList.add('validate__error');
            }
        };
    },
    
    loginToAppRoute(args) {
        View.showApp();
        View.showCurrentUser(args[0]);
    },

    showNoticeRoute(args) {
        View.showNotice(...args);
    },
    
    showMessageRoute(args) {

        let messagesList = document.querySelector('.messages');
        
        View.showMessage(...args);
        
        document.forms.publish.message.value = '';
        messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
    },
    
    updateUsersRoute(args) {
        View.showUserOnline(...args);
    },

    uploadPhotoRoute(args) {
        
        document.onclick = (e) => {
            if (e.target.id == 'changeAvatar') {
                e.preventDefault();
                __showUploadPhotoForm(...args);
            }
                
            if (e.target.id == 'closeUploadForm') {
                e.preventDefault();
                View.removeUploadPhotoForm();
            }
        }
    },

    updatePhotoRoute(args) {
        //user, currentUser
        let url;
        let user = args[0];
        let currentUser = args[1];
        let photos = document.querySelectorAll('.photo__link');

        View.removeUploadPhotoForm();

        for (let i = photos.length - 1; i>= 0 ; i --) {
            let photo = photos[i];

            if (photo.getAttribute('login') === user.login) {

                url = `http://${Setting.host}:${Setting.portMedia}/photos/${user.login}.jpg?${getRandomString()}`;
                photo.src = url;
           }
        }

        if (currentUser.login == user.login) {
            
            // console.log(currentUser instanceof User );
            
            currentUser.photo = url;
        }

    }
}