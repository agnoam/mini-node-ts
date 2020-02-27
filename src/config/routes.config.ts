import { Application, Request, Response } from "express";

console.log("import routes.config");

module.exports = (app: Application) => {
    // Define the api to where go
    app.use("/app", require("../routes/app.routes"));

    app.get('/', (req: Request, res: Response) => {
        res.send('node-ts server is running ;)');
    });
}