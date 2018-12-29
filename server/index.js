const logger = require("./utils/logger");
const config =require("./config/config");
logger.info("init");

let args = process.argv;
let APP_MODE = true;

args.forEach(arg => {
    if(arg.indexOf('--get') != -1){
        APP_MODE = false;
    }
});

if(!APP_MODE){
    logger.info("starting retriever");
    const core = require("./core/retrieve");
    core.start();
    return;
} 


logger.info("starting server");

const express = require("express");
const api = require("./api");
const app = express();

app.use((req, res, next) => {
    // common middleware

    return next();
});

app.use("/api", api);

// 404
app.use((req, res, next) => next({code: 404, msg : "Not found"}));

app.use((err, req, res, next) => {
    let errorCode = err.status || err.code || 500;
    if(errorCode < 499){
        logger.warn(err.msg || err);
        console.error(err);
    } else {
        logger.error(err.msg || err);
        console.error(err);
    }
    return res.status(errorCode).json(err.message || err.msg || "Something went wrong");
})
app.listen(config.server.port, _ => {
    logger.info(`server listriening on port : ${config.server.port}`);
});
