const Bluebird =require("bluebird");
const request = require("request");

module.exports  = {
    get : (uri, options) => {
        return new Bluebird((resolve, reject) => {
            request.get(uri,options, (err, resp, body )=> {
                if(err) return reject(err);
                else return resolve([resp, body]);
            });
        });
    },
    post : (uri, options) => {
        return new Bluebird((resolve, reject) => {
            request.post(uri,options, (err, resp, body )=> {
                if(err) return reject(err);
                else return resolve([resp, body]);
            });
        });
    }

}