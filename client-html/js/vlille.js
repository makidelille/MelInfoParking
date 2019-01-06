var BASE_URL = "http://localhost:3000/api/vlille/";


var map;
var stationid;
var inv = false;
var sortField = "nom_station";


function getData(url, cb){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev){
        if(this.readyState === XMLHttpRequest.DONE) {
            try{
                data = JSON.parse(this.responseText);
            } catch( e){
                return cb(e);
            }
            cb(null, data);

        }
    };
    req.open("GET", url);
    req.send();
}


var heatMap;
function initMap (){
    var hash = window.location.hash;
    if(hash != ""){
        stationid = Number.parseInt(hash.replace("#", ""));
        if(isNaN(stationid)){
            console.warn("invalid stationid");
            stationid = undefined;
        }
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 50.693768, lng: 3.16766},
        zoom: 12
    });

    


    switch(window.location.pathname){
        case "/vlille/heatmap":
            loadHeatMap(showHeatMap);
            break;
        case "/vlille/info":
            loadData(stationid, function(stationInfo){
                var station = stationInfo.config;
                var m = new google.maps.Marker({
                    position: {
                        lat: station.geo_lat,
                        lng: station.geo_lng 
                    },
                    map: map,
                    title: station.nom_station,
                    clickable: true
                });

                map.panTo({
                    lat: station.geo_lat,
                    lng: station.geo_lng 
                });
                map.setZoom(20);

                history2chart(stationInfo.data);
                
            })
            return;
        case "/vlille/":
        default:
            loadAllData(function(stations){                
                loadGeneralInfos(stations, sortField, inv);

                stations.forEach(function(station){
                    var m =  new google.maps.Marker({
                        position: {
                            lat: station.geo_lat,
                            lng: station.geo_lng 
                        },
                        map: map,
                        title: station.nom_station,
                        clickable: true
                    });

                    m.addListener('click', function(){
                        document.getElementById(station.id).scrollIntoView();
                    });
                });
            });
            return;
    }

    
}

function loadAllData(cb){
    getData(BASE_URL, function(err, stations){
        if(err) {
            console.error(err);
            return;
        }

        stations = stations.map(function(st){
            st.tpe = st.type === "AVEC TPE" ? "Oui" : "Non";
            return st;
        });
        
        cb(stations);
    });
}

function loadData(stationId, cb){
    getData(BASE_URL + "station/" + stationId, function(err, station){
        if(err) {
            console.error(err);
            return;
        }

        station.config.tpe = station.config.type === "AVEC TPE" ? "Oui" : "Non";

        
        cb(station);
    });
}

function history2chart(jsonData){
    var placesDispoData = jsonData.map(function(d) { 
        return { y: d.value.placesdispo, t: new Date(d.time)}
    });
    var velosDispoData = jsonData.map(function(d) { 
        return { y: d.value.velosdispo, t: new Date(d.time)}
    });
    
    console.log(placesDispoData);
    var ctxl = document.getElementById("lineChart").getContext('2d');

    new Chart(ctxl, {
        type: 'line',
        data: {
            datasets: [{
                label: "Places dispo",
                data:placesDispoData,
                borderColor: "#008800",
                fill: false,
                lineTension: 0.25,
                pointRadius: 0
            },
            {
                label: "Velos dispo",
                data:velosDispoData,
                borderColor: "#880000",
                fill: false,
                lineTension: 0.25,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    distribution: 'linear',
                    time: {
                        unit: "hour",
                        displayFormats: {
                            hour: 'D MMM hh:mm'
                        }
                    }
                }]
            },
            tooltip: {
                intersect: false,

            }
        }
        });
}


function loadGeneralInfos(stations=sts, sortField, inverted){
    var tpl = $("#tpl-station").html();
    Mustache.parse(tpl);
    $("#general table tbody").html("");

    stations.sort(function(a,b){
        return (inverted ? -1 : 1) * (""+ a[sortField]).localeCompare((""+ b[sortField]));
    }).forEach(function(st, i) {
        st.index = (i+1);
        $("#general table tbody").append(Mustache.render(tpl, st));
    });

    $("#count").html("("+ stations.length +")");

}

function sortTable(sortFieldLocal){
    if(sortFieldLocal == sortField) {
        inverted = !inverted;
    } else {
        inverted = false;
        sortField = sortFieldLocal;
    }

    loadAllData(function(stations){
        loadGeneralInfos(stations, sortField, inverted);
    })    
}

function loadHeatMap(cb){
    getData(BASE_URL + "/heatmap/now", function(err, data){
        if(err) return err;
        setupHeatMapAnimations(function(){
            cb(data.values, Date.now());
        });
    });
}

function setupHeatMapAnimations(cb){
    getData(BASE_URL + "/config", function(err, conf){
        if(err) return err;
        console.log(conf)
        var max = conf.max;
        var min = conf.min;
        var diff = 60 * 1000 * 5;

        var refresh = function(time, cb){
            getData(BASE_URL + "/heatmap/" + time, function(err, heat){
                if(err) return cb(err);
                showHeatMap(heat.values, false);
                
            })
        }
        
        
        var tpl = $("#tpl-slider-heatmap").html();
        Mustache.parse(tpl);
        $("#options").html(Mustache.render(tpl, {max: max, min: min}));
        
        
        $("#slider input").on("change", function(){
            var date = new Date(+this.value);
            $("#timeLabel").html(date.toLocaleDateString() + " " + date.toLocaleTimeString());
            refresh(this.value);
        });
        
        var date = new Date();
        $("#timeLabel").html(date.toLocaleDateString() + " " + date.toLocaleTimeString());

        cb();
    });
}

function playHeatMap(){
    var TIMEOUT = 5000;
    var input = $("#slider input");
    var current = input[0].min;
    var max = input[0].max;
    var interval = setInterval(function(){
        if(current >= max){
            clearInterval(interval);
        } else {
            input.val(current);
            input.trigger('change');
            current += TIMEOUT;
        }
    }, TIMEOUT);
}


function showHeatMap(heat, velos = false){
    if(heatMap == undefined){
        heatMap = new google.maps.visualization.HeatmapLayer({
            map: map,
            dissipating: true,
            radius: 20
        });
    }


    var pointsPlaces = [];
    var pointsVelos = [];
    heat.forEach(function(stationHeat){
        var places = stationHeat.placesdispo;
        var velos = stationHeat.velosdispo;

        var position =  new google.maps.LatLng(stationHeat.geo_lat, stationHeat.geo_lng);
        pointsPlaces.push({location: position, weight: places});
        pointsVelos.push({location: position, weight: velos});
    });

    heatMap.setData(velos ? pointsVelos : pointsPlaces);


}