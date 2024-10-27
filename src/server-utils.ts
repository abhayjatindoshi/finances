import { Application, NextFunction, Router, Request, Response } from "express";
import { lstatSync, readdirSync } from "fs";
import path from "path";
import ApiError from "./api-error";

export function loadRouters(app: Application): void {
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
                        const [routerUrl, router] = loadRouter(routerPath);
                        app.use(routerUrl, router);
                        console.log(`Router loaded: ${routerUrl}`);
                    } catch (e) {
                        console.error(`Failed to load router: ${routerPath} : ${e}`);
                    }
                })
        })
}

function loadRouter(routerPath: string): [string, Router] {
    const split = routerPath.split(path.sep)
    const routerVersion = split[split.length - 2];
    const routerName = split[split.length - 1].split('.')[0];
    const routerUrl = `/api/${routerVersion}/${routerName}`;
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
    apiError.respond(res);
}