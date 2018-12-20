const logManager  = require("winston");

const logger = logManager.createLogger({
    format :  logManager.format.simple(),
    transports: [ new logManager.transports.Console() ]
});

module.exports = logger;