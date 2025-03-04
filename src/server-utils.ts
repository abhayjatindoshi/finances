import { Application, NextFunction, Router, Request, Response, RequestHandler } from "express";
import { lstatSync, readdirSync } from "fs";
import path from "path";
import ApiError, { ApiErrorCode } from "./api-error";

export function loadRouters(prefix: string, app: Application): void {
  const routesBaseFolder = path.join(__dirname, 'routes')
  readdirSync(routesBaseFolder)
    .map(folderName => path.join(routesBaseFolder, folderName))
    .filter(folderPath => lstatSync(folderPath).isDirectory())
    .forEach(folderPath => {
      readdirSync(folderPath)
        .map(name => path.join(folderPath, name))
        .filter(routerPath => lstatSync(routerPath).isFile())
        .forEach(routerPath => {
          try {
            const [routerUrl, router] = loadRouter(prefix, routerPath);
            app.use(routerUrl, router);
            console.log(`Router loaded: ${routerUrl}`);
          } catch (e: any) {
            console.error(`Failed to load router: ${routerPath} : ${e} : ${e.stack}`);
          }
        })
    })
}

function loadRouter(prefix: string, routerPath: string): [string, Router] {
  const split = routerPath.split(path.sep)
  const routerVersion = split[split.length - 2];
  const routerName = split[split.length - 1].split('.')[0];
  const routerUrl = `${prefix}/${routerVersion}/${routerName}`;
  const router = require(routerPath).default;
  return [routerUrl, router];
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  let apiError: ApiError

  if (err instanceof ApiError) {
    apiError = err;
  } else {
    apiError = new ApiError();
    apiError.cause = err;
  }

  console.error(apiError.cause);
  if (apiError.code == ApiErrorCode.NOT_ALLOWED) {
    res.redirect('/error?error=app.loginNotAllowed');
    return;
  }
  apiError.respond(res);
}

export function templateString(template: string[]): TemplateStringsArray {
  const templateStringsArray: any = template as readonly string[];
  templateStringsArray.raw = templateStringsArray;
  return templateStringsArray;
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const randomNumbers = new Uint8Array(256)
let cur = 9999999
export function cryptoRandomId(): string {
  let id = ''
  let len = 0
  let v = 0
  while (len < 16) {
    if (cur < 256) {
      v = randomNumbers[cur] >> 2
      cur++
      if (v < 62) {
        id += alphabet[v]
        len++
      }
    } else {
      crypto.getRandomValues(randomNumbers)
      cur = 0
    }
  }

  return id
}