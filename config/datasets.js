module.exports = [
    {
        name: "disponibilite-parkings",
        url : "https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=disponibilite-parkings&rows=30",
        options : {json: true},
        transform: (body) => {
            if(body.error || body.errorcode){
                throw new Error(body.error);
            }
            return body.records.map(rec => {
                return {
                    recordid: rec.recordid,
                    id : rec.fields.id,
                    affichage: rec.fields.aff,
                    max: rec.fields.max,
                    dispo: rec.fields.dispo,
                    etat: rec.fields.etat,
                    date: rec.record_timestamp
                };
            });
        }
    },
    {
        name: "vlille-realtime",
        url: "https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&rows=300",
        options: {json: true},
        transform: (body) => {
            if(body.error || body.errorcode){
                throw new Error(body.error);
            }
            return body.records.map(rec => {
                return {
                    recordid: rec.recordid,
                    id: rec.fields.libelle,
                    etat: rec.fields.etat,
                    velosdispo: rec.fields.nbvelosdispo,
                    placesdispo: rec.fields.nbplacesdispo,
                    connexion: rec.fields.etatconnexion,
                    date: rec.fields.datemiseajour
                };
            });
        }
    }
]

