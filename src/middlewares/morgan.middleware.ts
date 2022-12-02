
import { inject, injectable } from "inversify";
import morgan, { StreamOptions } from "morgan";
import winston from "winston";

import { TYPES } from "../configs/di.types.config";
import { LoggerDriver } from '../drivers/logger.driver';


@injectable()
class MorganMiddleware {
  constructor(@inject(TYPES.LoggerDriver) private LoggerDriver: LoggerDriver) {}

  // Override the stream method by telling
  // Morgan to use our custom logger instead of the console.log.
  private stream: StreamOptions = {
    // Use the http severity
    write: (message) => this.LoggerDriver.Logger.http(message)
  };

  // Skip all the Morgan http log if the 
  // application is not running in development mode.
  // This method is not really needed here since 
  // we already told to the logger that it should print
  // only warning and error messages in production.
  private skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
  };

  // Build the morgan middleware
  public implementation = morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ":method :url :status :res[content-length] - :response-time ms",
    // Options: in this case, I overwrote the stream and the skip logic.
    // See the methods above.
    { stream: this.stream, skip: this.skip }
  );
}

export default MorganMiddleware;