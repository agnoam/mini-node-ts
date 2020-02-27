import { Request, Response } from "express";
import { ResponseStatus } from "../utils/consts";

console.log("import app.controller");

export module AppCtrl {
    export function doPost_R(req: Request, res: Response): Response {
        return res.status(ResponseStatus.Ok).json({
            date: Date.now(),
            description: 'This is the date right now'
        });
    }
}