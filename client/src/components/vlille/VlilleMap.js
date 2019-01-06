import { h, Component } from 'preact';
import {GOOGLE_API_KEY} from "../../service/api"

import Map, { GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

class VlilleMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
        }
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
    }
    
    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            // showingInfoWindow: true
        });
    };

    onMapClicked = (props) => {
        // if (this.state.showingInfoWindow) {
        //     this.setState({
        //         showingInfoWindow: false,
        //         activeMarker: null
        //     })
        // }
    };

    render(props) {
        const style = {
            width: '50%',
            height: '400px',
            position: 'fixed',
            bottom: '15px',
            right: '15px'
        }


        return (
            <Map
                google={this.props.google}
                onClick={this.onMapClicked}
                zoom={11}
                initialCenter={{lat: 50.693768, lng: 3.16766}}
                style={style}
            >
                { 
                    props.markers.map(marker => <Marker
                        onClick={this.onMarkerClick}
                        name={marker.name}
                        position={marker.position}
                    />
                    )
                }
                

                {/* <!-- <InfoWindow
                //     marker={this.state.activeMarker}
                //     visible={this.state.showingInfoWindow}
                // >
                //     <h1>
                //         {this.state.selectedPlace.name}
                //     </h1>
                // </InfoWindow> */}
            </Map>
        )
    };
}


export default GoogleApiWrapper({
    apiKey: GOOGLE_API_KEY,
})(VlilleMap)