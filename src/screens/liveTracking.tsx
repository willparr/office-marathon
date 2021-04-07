import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Button, Box } from '../providers/theme';
import { useLocationData } from '../services/location';
import { predictUserDirection } from '../services/location/track';

type GpsLocation = {
    latitude: number;
    longitude: number;
}

// eslint-disable-next-line max-len
export const LiveTrackingScreen = (): React.ReactElement => {
  const [locationPrediction, setLocationPrediction] = useState<GpsLocation | undefined>();
  const navigation = useNavigation();

  const locations = useLocationData();
  console.log('[prediction]', locationPrediction);

  useEffect(() => {
    if (locations.length > 2) {
      const prediction = predictUserDirection(locations[locations.length - 1]);
      setLocationPrediction(prediction);
    }
  }, [locations.length]);

  return (
      <Box variant='page'>
        {!!locationPrediction
        && <MapView
        initialRegion={
            { latitude: locations[0].coords.latitude,
              longitude: locations[0].coords.longitude,
              longitudeDelta: 0.01,
              latitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
            <Marker
            coordinate={locationPrediction}
            />
        </MapView>
        }
        <Button title="Go Back" variant='primary' onPress={() => {
          navigation.navigate('Distance');
        }}>Go Back</Button>
      </Box>
  );
};
