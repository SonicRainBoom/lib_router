'use strict';
import * as restify from "restify";
import {RequestHandler, Server, ServerOptions} from "restify";
export {Request, Response, Next} from 'restify';
import {SRBEvent} from "lib_srbevent";

export interface RouterOptions extends ServerOptions {
  server?: Server
  port: number,
  hostname?: string
}

export class Router {
  private server: Server;
  private port: number;
  private hostname: string;

  constructor(
    private opts: RouterOptions
  ) {
    this.server   = opts.server || restify.createServer(opts);
    this.port     = opts.port || 8080;
    this.hostname = opts.hostname || null;
  }

  addRoute(
    method: string,
    route: string,
    endpoint: RequestHandler
  ) {
    method = method.toUpperCase();
    switch (method) {
      case 'DELETE':
      case 'DEL':
        this.server.del(route, endpoint);
        break;
      case 'HEAD':
        this.server.head(route, endpoint);
        break;
      case 'PUT':
        this.server.put(route, endpoint);
        break;
      case 'POST':
        this.server.post(route, endpoint);
        break;
      case 'GET':
      default:
        this.server.get(route, endpoint);
        break;
    }
  };

  start() {
    this.server.on(
      'error', (e: {code: string}) => {
        switch (e.code) {
          case 'EADDRINUSE':
            if (this.port == 8081) {
              console.error('no port in range available');
              process.exit(1);
            }
            this.port = this.port == 8080 ? 8081 : 8080;
            console.log(`Port in use, retrying on port ${this.port}...`);
            this.server.close();
            if (this.hostname) {
              this.server.listen(this.port, this.hostname);
            } else {
              this.server.listen(this.port);
            }
            SRBEvent.event.emit('router_listening', this.port);
            break;
          default:
            console.error(`Error while stating server: ${e.code}`);
        }
      }
    );
    if (this.hostname) {
      this.server.listen(this.port, this.hostname);
    } else {
      this.server.listen(this.port);
    }
    SRBEvent.event.emit('router_listening', this.port);
  };
}
