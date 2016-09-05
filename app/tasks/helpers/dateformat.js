'use strict';

module.exports = function(datetime) {
    return new Date(datetime).toLocaleString("ru");
};