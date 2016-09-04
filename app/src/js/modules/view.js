'use strict';
import Setting from './app/setting'

//noinspection JSUnresolvedVariable
import noticeTemplate from '../../hbs/modal/notice.hbs';
//noinspection JSUnresolvedVariable
import messageTemplate from '../../hbs/main/message.hbs';
//noinspection JSUnresolvedVariable
import sidebarUserTemplate from '../../hbs/sidebar/user.hbs';
//noinspection JSUnresolvedVariable
import sidebarOnlineUsersTemplate from '../../hbs/sidebar/online.hbs';
//noinspection JSUnresolvedVariable
import loginTemplate from '../../hbs/modal/login.hbs';
//noinspection JSUnresolvedVariable
import uploadTemplate from '../../hbs/modal/upload.hbs';


export default {
    
    showNotice(status, text) {

        document.body.insertAdjacentHTML('afterbegin', noticeTemplate({
            status: status,
            text: text
        }));
    
        setTimeout(()=>{
            document.querySelector('.notice').remove()
        }, Setting.DisplayTimeNotification);
        
    },
    
    showMessage(message) {
    
        let messagesList = document.querySelector('.messages');
    
        document.querySelector('.messages').insertAdjacentHTML('beforeend', messageTemplate({
            username: message.user.name,
            login: message.user.login,
            photo: message.user.photo,
            datetime: message.datetime,
            message: message.text
        }));
        
        document.forms.publish.message.value = '';
        messagesList.scrollTop = messagesList.scrollHeight - messagesList.clientHeight
    },
    
    showCurrentUser(user) {

        let sidebar = document.querySelector('.sidebar');
        
        sidebar.insertAdjacentHTML('afterbegin', sidebarUserTemplate({
            name: user.name,
            login: user.login,
            photo: user.photo
        }));
    },
    
    showUserOnline(users) {
        let usersOnline = document.querySelector('.users');
    
        usersOnline.innerHTML = sidebarOnlineUsersTemplate({
            users: users,
            count: users.length
        });
    },
    
    showLoginForm() {
         document.body.insertAdjacentHTML('afterbegin', loginTemplate());
    },
    
    showUploadForm() {
         document.body.insertAdjacentHTML('afterbegin', uploadTemplate());
    },
    
    removeUploadPhotoForm() {

        let modalPhoto = document.getElementById('modalPhoto');
    
        if (modalPhoto) {
            let wrapper = document.querySelector('.wrapper');
            wrapper.classList.remove('background__opacity');
            modalPhoto.remove();
        }

    },
    
    loggedApp() {
        
        let loginWrapper = document.querySelector('.login');
        let appWrapper = document.querySelector('.wrapper');
    
        loginWrapper.remove();
        appWrapper.classList.remove('is_hide');
    },
    
    setPhotoBackground(binData) {
        let dropAria = document.getElementById('dropAria');
        dropAria.style.backgroundImage = `url(${binData})`;
        dropAria.innerText = '';
    }
    
}