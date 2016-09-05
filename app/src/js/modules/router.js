'use strict';

import Controller from './controller'

export default {
	handle(route, ...args) {
        // console.log('route');
        // console.log(args);
		let routeName = route + 'Route';

		if (!Controller.hasOwnProperty(routeName)) {
      console.error('Route no found!');
    }
		Controller[routeName](args);
	}
}
