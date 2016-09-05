'use strict';

let Msg = function (type, session, user, text='') {
    this.type = type;
    this.session = session;
    this.user = user;
    this.text = text;
    this.datetime = new Date();
};

export { Msg }