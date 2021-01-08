import { useCallback, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import 'normalize.css';
import styled from 'styled-components';
import { v4 } from 'uuid';
import '@reach/combobox/styles.css';

import mapStyles from './mapStyles';

const HeaderStyles = styled.h1`
    position: absolute;
    top: 0;
    left: 0; 
    z-index: 2;
    background-color: transparent;
    font-family: Arial, Helvetica, sans-serif;
    padding-left: 20px;
`;

const libraries = ['places'];
const mapContainerStyle = {
    width: '100vw',
    height: '100vh'
};
const center = {
    lat: 52.520008,
    lng: 13.404954
};
const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true
};

export default function App() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey,
        libraries
    });
    const [giftMarkers, setGiftMarkers] = useState([]);
    const [selectedGift, setSelectedGift] = useState(null);

    const onMapClick = useCallback(
        e =>
            setGiftMarkers(val => [...val, {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                time: new Date()
            }]),
        []
    );

    const mapRef = useRef();
    const onMapLoad = useCallback(map => mapRef.current = map, []);

    if (loadError) return 'Error loading!';
    if (!isLoaded) return 'Loading Maps...';

    return (
        <div>
            <HeaderStyles>Zu Verschenken 🎁</HeaderStyles>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={center}
                options={options}
                onClick={onMapClick}
                onLoad={onMapLoad}
            >
                {giftMarkers.map(item => (
                    <Marker
                        key={v4()}
                        position={{
                            lat: item.lat,
                            lng: item.lng
                        }}
                        icon={{
                            url: '/gift.png',
                            scaledSize: new window.google.maps.Size(30, 30),
                            origin: new window.google.maps.Point(0, 0),
                            anchor: new window.google.maps.Point(15, 15)
                        }}
                        onClick={() => setSelectedGift(item)}
                    />
                ))}
                {selectedGift ? (
                    <InfoWindow
                        position={{
                            lat: selectedGift.lat,
                            lng: selectedGift.lng
                        }}
                        onCloseClick={() => setSelectedGift(null)}
                    >
                        <div>
                            <h3>Zu Verschenken!</h3>
                            <p>Spotted {formatRelative(selectedGift.time, new Date())}</p>
                        </div>
                    </InfoWindow>
                ) : null}
            </GoogleMap>
        </div>
    );
}