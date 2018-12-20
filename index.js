const logger = require("./utils/logger");
const core = require("./core/retrieve");

logger.info("init");

logger.info("start retreiver");
core.start();
