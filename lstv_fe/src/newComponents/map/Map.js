import React from 'react';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import styles from './styles.json';

const Map = ({ defaultCenter, disableDefaultUI, markers, children, ...rest }) => {
    return (
        <GoogleMap
            defaultOptions={{ styles, disableDefaultUI }}
            defaultCenter={defaultCenter}
            defaultZoom={12}
            {...rest}
        >
            {markers.map((coords) => (
                <Marker key={`${coords?.lng},${coords?.lat}`} position={coords} />
            ))}
        </GoogleMap>
    );
};

Map.defaultProps = {
    defaultCenter: {
        lat: 40.7128,
        lng: -74.0060,
    },
    markers: [],
    disableDefaultUI: true,
};

export default withGoogleMap(Map);
