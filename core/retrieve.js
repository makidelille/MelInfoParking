const Bluebird = require("bluebird");
const request = require("../utils/request");
const datasets = require("../config/datasets");
const config = require("../config/config.json");
const db = require("./database");
const logger = require("../utils/logger");


function getData(){
    logger.info("Retreiving data");
    let start = Date.now()
    let dataProm = datasets.map(set => 
        request.get(set.url, set.options)
        .spread((_, body) => {
            let transform = set.transform ? set.transform(body) : body;
            return transform;
        }).then(dataArray => {
            // push en bdd
            return db(config.mongo.collection, collection => collection.insertOne({
                dataset : set.name,
                time: Date.now(),
                data: dataArray
            }));
        }).then(res => {
            logger.info(`${set.name} : data pushed to db`);
        }).catch(err => {
            logger.warn(`${set.name} : error while retreiving data`);
            logger.warn(err);
            return Bluebird.resolve();
        })
    )
    // faire la corélation
    return Bluebird.all(dataProm).then(_  => {
        logger.info(`Retreived data in ${Date.now() - start}ms`);
    });
}

let interval;

module.exports = {
    start : () => {
        getData();
        interval =  interval ? interval : setInterval(getData, config.retrieve.interval);
    },
    stop : () => {
        inteveral ? clearInterval(interval) : null;
    }
}