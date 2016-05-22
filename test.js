'use strict';
var router   = require('./lib/router');
var srbEvent = require('lib_srbevent');

setTimeout(
  () => {
    console.error('timeout after 30 sec.');
    process.exit(1);
  }, 30000
);

srbEvent.SRBEvent.event.on(
  'router_listening', (port)=> {
    if (port == 12348) {
      console.log('server listening and event fired.');
      process.exit(0);
    } else {
      console.error('port differs.');
      process.exit(1);
    }
  }
);

new router.Router({port: 12348}).start();
