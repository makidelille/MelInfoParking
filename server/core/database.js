const mongo = require("mongodb").MongoClient;
const Bluebird = require("bluebird");
const config = require("../config/config");


let apply2Collection = function(collectionName, cb){
    return new Bluebird((resolve, reject) => {
        mongo.connect(config.mongo.uri, (err, client) => {
            if(err) return reject(err);
          
            return cb(client.db().collection(collectionName)).then((data) => {
                client.close();
                resolve(data);
            }).catch(err => reject(err));
        });

    })

}

module.exports = apply2Collection;



