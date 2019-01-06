import { h, Component } from 'preact';
import { Line } from "react-chartjs-2";
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from "reactstrap";
import VlilleService from "../../service/api";


export default  class VlilleStation extends Component {
    toggle() {
        this.setState({
          modal: !this.state.modal
        });

        if(this.state.modal){

            VlilleService.get.station(this.props.stationId).then(jsonData => {
                console.log(jsonData);
    
                var placesDispoData = jsonData.data.map(function(d) { 
                    return { y: d.value.placesdispo, t: new Date(d.time)}
                });
                var velosDispoData = jsonData.data.map(function(d) { 
                    return { y: d.value.velosdispo, t: new Date(d.time)}
                });
    
                this.setState({
                    initialize: true,
                    config: jsonData.config,
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
            });
        }

        console.log(this.props);
    }

    componentWillMount(){
        this.state = {
            modal: false,
            initialize: false
        };

        this.toggle = this.toggle.bind(this);
    }   
    render(){
        let infos =<div>Chargement en cours</div>;
        if(this.state.initialize){
            infos = <div>
                <h1>Historique</h1>
                <Line 
                        data={this.state.data}
                        options={this.state.options}
                ></Line>
                </div>
        }

        return (
            <div>
                <Button color="info" onClick={this.toggle}>Historique</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={"modal-dialog modal-lg"} backdrop={true}>
                    <ModalHeader toggle={this.toggle}>Informations station n°{this.props.stationId}</ModalHeader>
                    <ModalBody>
                        {infos}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>Ok</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )

    }
}