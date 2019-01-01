const express = require("express");
const vData = require("../services/vlille.data");

const router = express.Router();

// router.get("/data", (req, res) => {
//     return getDataGlobal()
//         .then(data => res.json(data))
// });

router.get("/", async (req, res) => {
    let config  = await vData.getConfig();
        
    return res.json(config);
});

router.get("/station/:stationId", async (req, res, next) => {
    let stationid = Number.parseInt(req.params.stationId);
    if(isNaN(stationid)){
        return next();
    }

    let data = await vData.getData(stationid);
    let config = await vData.getConfig(stationid);

    config = config.find(c => c.id === stationid);

    return res.json({data, config});
});

router.get("/config", async (req,res) => {
    let time = await vData.getTimeRange();

    return res.json(time[0]);
});

router.get("/heatmap/:time", async (req, res, next) => {
    let time = Number.parseInt(req.params.time);
    if(isNaN(time)){
        return next();
    }

    let datas = await vData.getDataGlobal(time);
    let config = await vData.getConfig();

    let data = format2Heatmap(datas[0], config);

    return res.json(data);
});

router.get("/heatmap/now", async (req, res) => {

    let datas = await vData.getDataGlobal(Date.now());
    let config = await vData.getConfig();
    
    let data = format2Heatmap(datas[0], config);
    
    return res.json(data);
});




module.exports = router;


function format2Heatmap(data, config) {
    data.values = data.values.map(d => {
        let conf = config.find(a => a.id === d.id);
        for (let k in conf) {
            d[k] = conf[k];
        }
        return d;
    });
    return data;
}

