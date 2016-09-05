'use strict';

let User = function (name, login) {
    this.name = name;
    this.login = login;
    this.photo = '';

    this.setPhoto = function(value) {
        this.photo = value;
    }
    
};

export {User}