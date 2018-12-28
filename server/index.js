const express = require("express");

const config =require("./config/config");
const logger = require("./utils/logger");
const core = require("./core/retrieve");
const api = require("./api");

logger.info("init");

logger.info("start retreiver");
// core.start();
// core.stop();


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
