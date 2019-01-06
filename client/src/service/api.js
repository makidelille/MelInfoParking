export const GOOGLE_API_KEY = "AIzaSyDY156eaKSVsg7MfgJF8ADHzsf9QmJYRew";

const BASE_URL = "http://localhost:3000/api/vlille";

let getFunctions = {
    config: () => {
        return fetch(`${BASE_URL}/config`).then(res => res.json());
    },
    all: () => {
        return fetch(BASE_URL)
            .then(res => res.json())
            .then(stations => {
                stations = stations.map(function(st){
                    st.tpe = st.type === "AVEC TPE" ? "Oui" : "Non";
                    return st;
                });

                return stations;
            });
    },
    station: (stationid) => {
        return fetch(`${BASE_URL}/station/${stationid}`)
            .then(res => res.json())
            .then(station => {
                station.config.tpe = station.config.type === "AVEC TPE" ? "Oui" : "Non";
                return station;
            });
    },
    heatmap: {
        now: () => {
            return fetch(`${BASE_URL}/heatmap/now`)
                .then(res => res.json())
                .then(res => res.values);
        },
        at: (time) => {
            return fetch(`${BASE_URL}/heatmap/${time}`)
                .then(res => res.json())
                .then(res => res.values);
        }
    }

};

export default { get: getFunctions, GOOGLE_API_KEY };


