var BASE_URL = "http://localhost:3000/api/vlille/";


var map;
var inv = false;
var sortField = "nom_station";


function getData(url, cb){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev){
        if(this.readyState === XMLHttpRequest.DONE) {
            try{
                data = JSON.parse(this.responseText);
                cb(null, data);
            } catch( e){
                cb(e);
            }

        }
    };
    req.open("GET", url);
    req.send();
}

function loadData (cb){
    getData("/config.json", function(err, raw){
        if(err) {
            console.error(err);
            return;
        }
        var stations = raw.data;
        stations = stations.map(function(st){
            st.tpe = st.type === "AVEC TPE" ? "Oui" : "Non";
            return st;
        });
        
        cb(stations);
    });
}

function initMap (){
    switch(window.pathname){
        case "/vlille/info":
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 50.693768, lng: 3.16766},
                zoom: 12
            });

            return;
        case "/vlille/":
        default:
            loadData(function(stations){
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: 50.693768, lng: 3.16766},
                    zoom: 12
                    });
                
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

function onMarkerClick(station){
    return function(ev){
        console.debug(ev, station);
        var stationid = station.id;
        getData(BASE_URL + "history/" + stationid, (err, data) => {
            console.log(data);
        });
    };
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

    loadData(function(stations){
        loadGeneralInfos(stations, sortField, inverted);
    })    
}

