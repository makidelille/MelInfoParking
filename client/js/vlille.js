var stations = [];
var map;

function loadData (cb){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev){
        if(this.readyState === XMLHttpRequest.DONE) {
            try{
                stations = JSON.parse(this.responseText).data;
                cb(stations);
            } catch( e){
                console.error(e);
            }

        }
    };
    req.open("GET", "/config.json");
    req.send();
    
}

function initMap (){
    console.log("hello");
    loadData(function(stations){
        console.log("hello2")
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 50.693768, lng: 3.16766},
            zoom: 12
          });
          

        var makers = stations.map(function(station){
            var m =  new google.maps.Marker({
                position: {
                    lat: station.geo_lat,
                    lng: station.geo_lng 
                },
                map: map,
                title: station.nom_station,
                clickable: true
            });

            m.addListener('click', onMarkerClick(station));
            return m;
        });


        
    });


      


    // Todo add markers
}

function onMarkerClick(station){
    return function(ev){
        console.log(ev, station);
    };
}

function showHeatMap(date, velos = true){ //false pour les places dispos
    // todo afficher la heatmap des velos
}