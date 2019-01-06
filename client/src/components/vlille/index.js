import { h, Component } from 'preact';
import { Link } from 'preact-router';
import { Button } from "reactstrap";
import VlilleMap from "./VlilleMap";

import VlilleStation from "./VlilleStation";
import VlilleService from "../../service/api";

export default  class Vlille extends Component {
    Vlille(){
        this.state.config = undefined;
        this.state.stations = [];
        this.state.initialized = false;
    }

    componentWillMount(){
        VlilleService.get.config().then(value => {
            this.state.config = value;

            VlilleService.get.all().then(stations => {
                this.setState({
                    stations: stations.map(function(station){
                        station.position ={
                            lat: station.geo_lat,
                            lng: station.geo_lng 
                        }
                        station.name = station.nom_station;
                        return station;
                    }),
                    initialized: true
                });
            });
        });
    }

    render(props, state){
        return state.initialized ? (
            <div>
                <div id="general" class="row">
                    <h1>Liste des stations de v'Lille <span id="count"></span></h1>
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col" onclick="sortTable('nom_station')">Nom de la station</th>
                                <th scope="col" onclick="sortTable('tpe')">Terminal de paiement</th>
                                <th scope="col" onclick="sortTable('adresse')">Adresse</th>
                                <th scope="col" onclick="sortTable('geo_lat')">Latitude</th>
                                <th scope="col" onclick="sortTable('geo_lng')">Longitude</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.stations.map((station, index) => 
                                <tr>
                                    <td scope="row">{index}</td>
                                    <td>{station.nom_station}</td>
                                    <td>{station.tpe}</td>
                                    <td>{station.adresse}</td>
                                    <td>{station.geo_lat}</td>
                                    <td>{station.geo_lng}</td>
                                    <td><VlilleStation stationId={station.id}></VlilleStation></td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
                <div class="row p-10">
                    <VlilleMap markers={state.stations}/>
                </div>
            </div>   
        ) : (<div> Chargement en cours </div>)
    }
}