import { Application, Request, Response, NextFunction } from 'express';

enum LogLevels {
    Error = 7, // Defining starting point to the enum
    Warn,
    Custom,
    Info,
    Debug
}
  
enum Colors {
    Error = "red",
    Warn = "yellow",
    Custom = "magenta",
    Info = "white",
    Debug = "blue"
}

interface DocOptions {
    // Route of apiDocs
    apiDocs?: string; // Default value: "/api-docs"
    apiDocsPrefix?: string;
    
    // Route of swaggerUI
    swaggerUi?: string; // Default value: "/docs"
    swaggerUiPrefix?: string;
}

// Warning, Be advised: Not all these options still supported, please check before use. see https://oas-tools.github.io/docs/migration
declare interface V2Options {
    loglevel?: LogLevels | string; // Default value: `LogLevels.Info`
    logfile?: string; // Log file path (ignored when using `customLogger` option)
    customLogger?: Object;
    customErrorHandling?: boolean;
    controllers?: string; // Controllers location path (default: `${cwd}/controllers`)
    checkControllers?: boolean; // Default value: true
    strict?: boolean; // Default value: false
    router?: boolean; // Default value: true
    validator?: boolean; // Default value: true
    oasSecurity?: boolean; // Default value: false
    securityFile?: object; // Default value: null
    oasAuth?: boolean; // Default value: false
    grantsFile?: object; // Default value: null
    docs?: DocOptions;
    // ignoreUnknownFormats?: boolean; // Default value: true
}

declare interface LoggerOptions {
    customLogger?: Object; // Default: `null`
    level?: LogLevels | string; // Default: `info`
    logFile?: boolean; // Default: `false`
    logFilePath: string; // Default: `./logs/oas-tools.log`
}

declare interface RouterOptions {
    disable?: boolean; // Default: `false`
    controllers: string; // Default: `./controllers`
}

declare interface ValidatorOptions {
    requestValidation: boolean; // Default: `true`
    responseValidation: boolean; // Default: `true`
    strict: boolean; // Default: `false`
}

declare interface AuthOptions {
    BasicAuth?: (token) => any;
    BearerAuth?: (token) => any;
    ApikeyAuth?: (token) => any;
    OAuth2?: (secDef, secScope) => any;
    OpenID?: (secDef, secScope) => any;
}

declare interface SecurityOptions {
    disable: boolean; // Default: `true`
    auth: AuthOptions; // Default: `null`
}

declare interface SwaggerOptions {
    disable?: boolean; // Default: `false`
    path?: string; // Default: `/docs`

    // TODO: Add custom interface for this
    ui?: Object; // Default: `null`
}

declare type OASResponseFunction = (statusCode: number) => void;
declare type RequestValidationError = Error;
declare type SecurityError = Error;
declare type AuthError = Error;
declare interface ErrorOptions {
    disable?: boolean; // Default: `false`
    printStackTrace?: boolean; // Default: `false`
    
    // TODO: Add custom interface for this
    customHandler?: (err: RequestValidationError | SecurityError | AuthError, send: OASResponseFunction) => void; // Default: `null`
}

declare interface MiddlewareOptions {
    router?: RouterOptions;
    validator?: ValidatorOptions;
    security?: SecurityOptions;
    swagger?: SwaggerOptions;
    error?: ErrorOptions;
}

declare interface Options {
    packageJSON?: string; // Default: `./package.json`
    oasFile?: string; // Default: `./api/oas-file.yaml`
    useAnnotations?: boolean; // Default: `false` (experimental)
    
    logger?: LoggerOptions;
    middleware?: MiddlewareOptions;
}

declare module '@oas-tools/core' {
    /**
     * Load external modules into the middleware chain.
     * 
     * @param {class | function} npmModule - class extending OASBase, or the middleware function itself.
     * @param {Options} options - Config object.
     * @param {integer} priority - Position of the chain in which the module will be inserted.
     */
    function use(npmModule: class | function, options: Options, priority: integer): void;

    /**
     * Function to initialize OAS-tools middlewares.
     * @param {object} app - Express server used for the application. Needed to register the paths.
     * @param {Options | V2Options} config - Config object overriding defaults.
    */
    async function initialize(app: Application, config?: Options | V2Options): Promise<void>;
}