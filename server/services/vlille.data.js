const Bluebird = require("bluebird");
const database = require("../core/database");
const config  = require("../config/config");
const logger  = require("../utils/logger");

const DATASET_CONFIG = "vlille-config";
const DATASET_DATA = "vlille-realtime";

function getData(stationid, endTime = Date.now() - 43200000, startTime = Date.now()){
    logger.debug(`Getting data for station: ${stationid}`);
    let start = Date.now();
    return database(DATASET_DATA, (collection, subresolve, subreject) => {
        let $match = {
            time: {
                $lte: startTime,
                $gte: endTime
            }
        };
        let $sort= {
            time: 1
        };
        let $project = {
            _id: 0,
            time: 1,
            value: {
                $arrayElemAt : [
                    {
                        $filter: {
                            input: '$values',
                            as: 'value',
                            cond: {$eq: ['$$value.id', stationid]}
                        }
                    },
                    0
                ]
                
            }
        };
        collection.aggregate(
            {$match},
            {$project},
            {$sort},
            (err, data) => {
                if(err) return subreject(err);
                else {
                    return subresolve(data.toArray());
                }
        });
    })
    .then(results => {
        logger.debug(`Data fetched in ${Date.now() - start}ms`);
        return results;
    });
}

function getDataGlobal(startTime = Date.now()){
    let start = Date.now();
    return database(DATASET_DATA, (collection, resolve, reject) => {
        let $query = {
            time: {
                $lte: startTime
            }  
        };
        return collection.find({
            $query, 
        }).sort({
            time: -1
        }).limit(1).toArray().then((result) => {
            logger.debug(`Data fetched in ${Date.now() - start}ms`);
            return resolve(result);
        })
    });
}

function getConfig(stationid)  {
    let start = Date.now();
    return database(DATASET_CONFIG, (collection, subresolve, subreject) => {
        collection
            .find({})
            .sort({ 
                time: -1
            }).limit(1)
            .toArray()
            .then(config => {
                logger.debug(`Config fetched in ${Date.now() - start}ms`);
                if(stationid != null){
                    return subresolve(config[0].values.filter(c => c.id === stationid));
                } else {
                    return subresolve(config[0].values);
                }

        });           
    });
}

function getTimeRange(){
    let start = Date.now();
    return database(DATASET_DATA, (collection, resolve, reject) => {
        let $group = {
            _id: null,
            max: { $max: "$time"},
            min: {$min: "$time"}
        }
        collection.aggregate({$group}, (err, data) => {
            if(err) return reject(err);
            else return resolve(data.toArray());
        });
    });
}

module.exports = {
    getData,
    getConfig,
    getDataGlobal,
    getTimeRange
}