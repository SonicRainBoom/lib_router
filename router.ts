"use strict";
import * as restify from "restify";
import {
  Request,
  Response,
  RequestHandler,
  Server,
  ServerOptions
} from "restify";
export {Request, Response, Next, ServerOptions} from 'restify';

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

  /**
   * a crude CORS based on `Qwerios`' comment in
   * https://github.com/mcavage/node-restify/issues/664
   *
   * See issues:
   * https://github.com/mcavage/node-restify/issues/284 (closed)
   * https://github.com/mcavage/node-restify/issues/664 (unresolved)
   *
   * @param additionalHeaders string[]
   * @return void
   */
  enableCORSFix(additionalHeaders: string[] = []): void {
    /*************************************
     Cors
     **************************************/
    this.server.use(restify.CORS());
    let headers = [
      "authorization",
      "withcredentials",
      "x-requested-with",
      "x-forwarded-for",
      "x-real-ip",
      "user-agent",
      "keep-alive",
      "host",
      "accept",
      "connection",
      "upgrade",
      "content-type",
      "dnt",
      "if-modified-since",
      "cache-control"
    ];

    restify.CORS.ALLOW_HEADERS = [
      ...restify.CORS.ALLOW_HEADERS || [],
      ...headers,
      ...additionalHeaders
    ];

    // Manually implement the method not allowed handler to fix failing
    // preflights
    this.server.on(
      "MethodNotAllowed",
      (request: Request, response: Response) => {
        if (request.method.toUpperCase() === "OPTIONS") {
          // Send the CORS headers
          //
          response.header("Access-Control-Allow-Credentials", true);
          response.header(
            "Access-Control-Allow-Headers",
            restify.CORS.ALLOW_HEADERS.join(", ")
          );
          response.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
          );
          response.header(
            "Access-Control-Allow-Origin",
            request.headers.origin
          );
          response.header("Access-Control-Max-Age", 0);
          response.header("Content-type", "text/plain charset=UTF-8");
          response.header("Content-length", 0);

          response.send(204);
        } else {
          response.send(new restify.MethodNotAllowedError());
        }
      }
    );
  }

  addRoute(
    method: string,
    route: string,
    endpoint: RequestHandler
  ): void {
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

  start(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      let nextPort    = 0;
      let tryCount    = 0;
      let maxTry      = 10;
      let currentPort = this.port;
      this.server.on('listening', ()=> {
        resolve(currentPort);
        return;
      });
      this.server.on(
        'error', (e: {code: string}) => {
          switch (e.code) {
            case 'EADDRINUSE':
              tryCount++;
              nextPort = this.port + tryCount;
              this.server.close();
              if (tryCount < maxTry) {
                console.log(`Port in use, retrying on port ${nextPort}...`);
                currentPort = nextPort;
                if (this.hostname) {
                  this.server.listen(currentPort, this.hostname);
                } else {
                  this.server.listen(currentPort);
                }
                return;
              }
              reject(e);
              return;
            default:
              reject(e);
              return;
          }
        }
      );
      if (this.hostname) {
        this.server.listen(this.port, this.hostname);
      } else {
        this.server.listen(this.port);
      }
    });
  };
}
