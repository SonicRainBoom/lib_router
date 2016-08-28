'use strict';
import {Router} from './router';

setTimeout(
  () => {
    console.error('timeout after 30 sec.');
    process.exit(1);
  }, 30000
);
setImmediate(async()=> {
  let port = await new Router({port: 12348}).start();
  if (port == 12348) {
    console.log('server listening and port matches.');
    process.exit(0);
  } else {
    console.error('server listening and port differs.');
    process.exit(1);
  }
});
