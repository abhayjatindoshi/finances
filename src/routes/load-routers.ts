import { Application, Router } from "express";
import { lstatSync, readdirSync } from "fs";
import path from "path";

export function loadRouters(app: Application): void {
    readdirSync(__dirname)
        .map(folderName => path.join(__dirname, folderName))
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