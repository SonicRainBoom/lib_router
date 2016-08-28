'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var router_1 = require('./router');
setTimeout(function () {
    console.error('timeout after 30 sec.');
    process.exit(1);
}, 30000);
setImmediate(function () __awaiter(this, void 0, void 0, function* () {
    var port = yield new router_1.Router({ port: 12348 }).start();
    if (port == 12348) {
        console.log('server listening and port matches.');
        process.exit(0);
    }
    else {
        console.error('server listening and port differs.');
        process.exit(1);
    }
}));
