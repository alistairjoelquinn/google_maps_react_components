import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { v4 } from 'uuid';

import config from './mapConfig';
import { getInitialUserLocations } from '../store/actions';
import ItemInfo from './ItemInfo';
import MapReset from './MapReset';

const Map = ({ onMapLoad, relocateMap, setClearSearchBar, setShowModal, setUserCoords }) => {
    const dispatch = useDispatch();
    const giftMarkers = useSelector(state => state.userLocations);
    const [selectedGift, setSelectedGift] = useState(null);

    const [directionsRequested, setDirectionsRequested] = useState(false);
    const [userCurrentLocation, setUserCurrentLocation] = useState('');
    const [userCurrentDestination, setUserCurrentDestination] = useState('');
    const [directionsResponse, setDirectionsResponse] = useState(null);

    const onMapClick = useCallback((e) => {
        setShowModal(true);
        setUserCoords({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            time: new Date()
        });
    });

    const getDirections = useCallback((lat, lng) => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setUserCurrentDestination({
                lat, lng
            });
            setDirectionsRequested(true);
            setSelectedGift(null);
        });
    }, []);

    const directionsCallback = useCallback((response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                console.log('response status OK: ', response);
                setDirectionsResponse(response);
                setDirectionsRequested(false);
            } else {
                console.log('reponse status NOT OK', response);
            }
        }
    }, []);

    useEffect(() => {
        dispatch(getInitialUserLocations());
    }, []);

    return (
        <GoogleMap
            {...config.mainConfig}
            onClick={onMapClick}
            onLoad={onMapLoad}
        >
            {directionsRequested && <DirectionsService
                options={{
                    destination: userCurrentDestination,
                    origin: userCurrentLocation,
                    travelMode: 'TRANSIT',
                }}
                callback={directionsCallback}
            />}
            {directionsResponse && <DirectionsRenderer
                options={{
                    directions: directionsResponse,
                }}
            />}
            {directionsResponse &&
                <MapReset
                    setDirectionsRequested={setDirectionsRequested}
                    setUserCurrentLocation={setUserCurrentLocation}
                    setUserCurrentDestination={setUserCurrentDestination}
                    setDirectionsResponse={setDirectionsResponse}
                    relocateMap={relocateMap}
                    setClearSearchBar={setClearSearchBar}
                />
            }
            {giftMarkers && giftMarkers.map(item => (
                <Marker
                    key={v4()}
                    position={{
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lng)
                    }}
                    icon={{
                        url: '/gift.png',
                        scaledSize: new window.google.maps.Size(30, 30),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(15, 15)
                    }}
                    onClick={() => {
                        setSelectedGift(item);
                    }}
                />
            ))}
            {selectedGift && (
                <InfoWindow
                    position={{
                        lat: parseFloat(selectedGift.lat),
                        lng: parseFloat(selectedGift.lng)
                    }}
                    onCloseClick={() => setSelectedGift(null)}
                >
                    <ItemInfo
                        selectedGift={selectedGift}
                        getDirections={getDirections}
                    />
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default Map;