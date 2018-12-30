const express = require("express");
const Bluebird = require("bluebird");
const database = require("../core/database");
const config  = require("../config/config");
const logger  = require("../utils/logger");

const router = express.Router();

router.get("/data", (req, res) => {
    return getDataGlobal()
        .then(data => res.json(data))
});

router.get("/history/:stationId", (req, res) => {
    let stationid = Number.parseInt(req.params.stationId);
    if(isNaN(stationid)){
        throw {status: 400, msg: "InvalidNumberFormat"};
    }

    return getData(stationid)
        .then(data => res.json(data))
});

router.get("/config", (req, res) => {
    return getConfig()
        .then(data => res.json(data))
});

router.get("/heatmap", (req, res) => {
    return getHeatMap()
        .then(data => res.json(data))
});

function getData(stationid, endTime = Date.now() - 43200000, startTime = Date.now()){
    logger.debug(`Getting data for station: ${stationid}`);
    return new Bluebird((resolve, reject) => {
        let start = Date.now();
        let dataset = "vlille-realtime";
        database(dataset, (collection) => {
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
            return new Bluebird((subresolve, subreject) => {
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
            }).then(results => {
                logger.debug(`Data fetched in ${Date.now() - start}ms`);
                return resolve(results);
            });
        }).catch(err => reject(err));
    })
}


function getDataGlobal(endTime = Date.now() - (43200000/2), startTime = Date.now()){
    return new Bluebird((resolve, reject) => {
        let start = Date.now();
        let dataset = "vlille-realtime";
        database(dataset, (collection) => {
            let $query = {
                time: {
                    $lte: startTime,
                    $gte: endTime
                }  
            };
            return collection.findOne({
                $query, 
                $orderby : {
                    time: -1
                }
            }).then(results => {
                logger.debug(`Data fetched in ${Date.now() - start}ms`);
                return resolve(results);
            });
        }).catch(err => reject(err));
    })
}

function getConfig()  {
    return new Bluebird((resolve, reject) => {
        let start = Date.now();
        let dataset = "vlille-config";
        database(dataset, (collection) => {
            let query = {
                $orderby : {
                    time: -1
                }
            }

            collection.findOne(query, (err, config) => {
                if(err) return reject(err);
                logger.debug(`Config fetched in ${Date.now() - start}ms`);
                return resolve(config);
            });

            return Bluebird.resolve();
            
        }).catch(err => reject(err));
    });
}

async function getHeatMap(){
    let start = Date.now();
    let datas = await getDataGlobal(Date.now() - 30000, Date.now());
    let configData = await getConfig();

    // Agrégation des données
    let obj = {}
    datas.forEach(row => row.data.forEach(
        raw => {
            let id = raw.id;
            if(obj[id] === undefined){
                obj[id] = {
                    info: null,
                    values : []
                }
            }

            let data = {
                placesdispo: raw.placesdispo,
                velosdispo: raw.velosdispo,
                total: raw.placesdispo + raw.velosdispo,
                etat: raw.etat,
                connexion: raw.connexion,
                date: raw.date
            }

            obj[id].values.push(data);
        }
    ));
    
    configData.data.forEach(conf => {
        obj[conf.id].info = conf;
    });


    logger.debug(`Heatmap fetched in ${Date.now() - start}ms`);
    return obj;

}


module.exports = router;
