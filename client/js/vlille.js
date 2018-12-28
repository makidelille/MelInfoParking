var stations = [];
var map;

function loadData (cb){
    var req = new XMLHttpRequest();
    req.onload = function(ev){
        try{
            stations =JSON.parse(req.responseText)
        } catch( e){
            console.error(e);
        }
    };
    req.open("GET", "/config.json");
    
}

function initMap (){
    loadData(function(){
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 50.693768, lng: 3.16766},
            zoom: 15
          });
          
        for(var station in stations){
            var marker = new google.maps.Marker({
                position: {
                    lat: station.geo_lat,
                    lng: station.geo_lng 
                },
                map: map,
                title: station.nom_station
            });


            marker.onclick = onMarkerClick(station);
        }
    });


      


    // Todo add markers
}

function onMarkerClick(station){
    return function(){
        // todo load hisotry of station
    };
}

function showHeatMap(date, velos = true){ //false pour les places dispos
    // todo afficher la heatmap des velos
}