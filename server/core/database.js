const mongo = require("mongodb").MongoClient;
const Bluebird = require("bluebird");
const config = require("../config/config");


let apply2Collection = function(collectionName, cb){
    return new Bluebird((resolve, reject) => {
        mongo.connect(config.mongo.uri).then((client) => {         
            return new Bluebird((subresolve, subreject) => {
                let collection = client.db().collection(collectionName);
                cb(collection, subresolve, subreject);
            }).then((data) => {
                client.close();
                return resolve(data);
            }).catch(err => reject(err));
        });

    })

}

module.exports = apply2Collection;



