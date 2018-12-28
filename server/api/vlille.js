const express = require("express");
const Bluebird = require("bluebird");
const database = require("../core/database");
const config  = require("../config/config");
const logger  = require("../utils/logger");

const router = express.Router();

router.get("/data", (req, res) => {
    return getData()
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

function getData(endTime = Date.now() - (43200000/2), startTime = Date.now()){
    return new Bluebird((resolve, reject) => {
        let start = Date.now();
        database(config.mongo.collection, (collection) => {
            let dataset = "vlille-realtime";
            let query = {
                $query : {
                    dataset
                },
                $min: {
                    time: startTime
                },
                $max: {
                    time: endTime
                },
                $orderby : {
                    time: -1
                }
            };
            return collection.find(query).toArray().then(results => {
                logger.debug(`Data fetched in ${Date.now() - start}ms`);
                return resolve(results);
            });
        }).catch(err => reject(err));
    })
}

function getConfig()  {
    return new Bluebird((resolve, reject) => {
        let start = Date.now();
        database(config.mongo.collection, (collection) => {
            let dataset = "vlille-config";
            let query = {
                $query : {
                    dataset
                },
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

async function getHeatMap(startTime, endTime){
    let start = Date.now();
    let datas = await getData(startTime, endTime);
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