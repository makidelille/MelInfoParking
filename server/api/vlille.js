const express = require("express");
const Bluebird = require("bluebird");
const database = require("../core/database");
const config  = require("../config/config");
const logger  = require("../utils/logger");

const router = express.Router();

// router.get("/data", (req, res) => {
//     return getDataGlobal()
//         .then(data => res.json(data))
// });

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
        .then(data => 
            res.json(data))
});


router.get("/config/:stationId", (req, res) => {
    let stationid = Number.parseInt(req.params.stationId);
    if(isNaN(stationid)){
        throw {status: 400, msg: "InvalidNumberFormat"};
    }
    return getConfig(stationid)
        .then(data => res.json(data))
});

router.get("/heatmap", (req, res) => {
    return getHeatMap()
        .then(data => res.json(data))
});

function getData(stationid, endTime = Date.now() - 43200000, startTime = Date.now()){
    logger.debug(`Getting data for station: ${stationid}`);
    let start = Date.now();
    let dataset = "vlille-realtime";
    return database(dataset, (collection, subresolve, subreject) => {
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
    let dataset = "vlille-realtime";
    return database(dataset, (collection, resolve, reject) => {
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
    let dataset = "vlille-config";
    return database(dataset, (collection, subresolve, subreject) => {
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
    }).catch(err => reject(err));
}

async function getHeatMap(){
    let start = Date.now();
    let datas = await getDataGlobal(Date.now() - 30000, Date.now());
    let config = await getConfig();
    
    let data = datas[0];
    data.values= data.values.map(d => {
        let conf = config.find(a => a.id === d.id);
        for(let k in conf){
            d[k] = conf[k];
        }
        return d;
    });

    logger.debug(`Heatmap fetched in ${Date.now() - start}ms`);
    return data;

}


module.exports = router;
