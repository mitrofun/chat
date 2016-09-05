'use strict';

import Setting from './app/setting'
import View from './view';

export default {

    showNoticeRoute(args) {

        // console.log('controller');
        // console.log(...args);

        View.showNotice(...args);
        
        setTimeout(()=>{
            document.querySelector('.notice').remove()
        }, Setting.DisplayTimeNotification);

    }
    
}