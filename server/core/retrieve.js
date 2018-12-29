const Bluebird = require("bluebird");
const request = require("../utils/request");
const datasets = require("../config/datasets");
const config = require("../config/config");
const db = require("./database");
const logger = require("../utils/logger");


function getData(set){
    logger.info(`[${set.name}] Retreiving data`);
    let start = Date.now()
    return request.get(set.url, set.options)
        .spread((_, body) => {
            let transform = set.transform ? set.transform(body) : body;
            return transform;
        }).then(dataArray => {
            // push en bdd
            return db(set.name, collection => collection.insertOne({
                time: Date.now(),
                values: dataArray
            }));
        }).then(res => {
            logger.info(`[${set.name}] data pushed to db`);
            logger.info(`[${set.name}] Retreived data in ${Date.now() - start}ms`);
        });
    }

let intervals = [];

module.exports = {
    start : () => {
        intervals = datasets.map(set => ({interval_time : (set.interval_second || config.retreive.interval) * 1000, set, interval: null}));
        intervals.forEach(int => {
            getData(int.set).then(_ => {
                int.interval = int.interval == null ? setInterval(() => getData(int.set), int.interval_time) : int.interval;
            }).catch(err => {
                logger.error("Could not initialise data query")
                logger.error(err);
            });
        })
    },
    stop : () => {
        intervals.forEach(int => {
            clearInterval(int.interval);
            int.interval = null;
        })        
    }
}