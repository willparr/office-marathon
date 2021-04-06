import React from 'react';
import MapView, { Polyline } from 'react-native-maps';
import { Dimensions } from 'react-native';
import { LocationObject } from 'expo-location';
import haversine from 'haversine';
import { Paragraph, Button, Box } from '../providers/theme';

interface MapReviewProps {
    locations: LocationObject[]
    isDoneTracking: boolean
    route: any
    navigation: any
}

// eslint-disable-next-line max-len
export const MapReviewScreen = ({ route, navigation } : MapReviewProps): React.ReactElement => {
  const { locations } = route.params;
  console.log(locations);
  const slimLocations = locations.map((location) => ({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  }));

  const maxSpeed = getMaxSpeed(locations);
  const minSpeed = getMinSpeed(locations);

  const distance = haversine(slimLocations[0], slimLocations[slimLocations.length - 1]);
  return (
      <Box variant='page'>
      <Box variant='page'>
        <MapView
        initialRegion={
            { latitude: locations[0].coords.latitude,
              longitude: locations[0].coords.longitude,
              longitudeDelta: 0.01,
              latitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
            <Polyline
            coordinates={slimLocations}
            fillColor={'red'}
            strokeWidth={3}
            />
        </MapView>
      </Box>
      <Box variant='page'>
          <Paragraph>Distance: {distance}</Paragraph>
          <Paragraph>Max Speed: {maxSpeed}</Paragraph>
          <Paragraph>Min Speed: {minSpeed}</Paragraph>
          <Button title="Go Back" variant='primary' onPress={() => {
            navigation.navigate('Distance');
          }}>Go Back</Button>
      </Box>
    </Box>
  );
};

function getMaxSpeed(locations: LocationObject[]): number {
  let maxSpeed = Number.MIN_SAFE_INTEGER;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < locations.length; i++) {
    const { speed } = locations[i].coords;
    if (speed) {
      if (speed > maxSpeed) {
        maxSpeed = locations[i].coords.speed as number;
      }
    }
  }
  return maxSpeed;
}

function getMinSpeed(locations: LocationObject[]): number {
  let minSpeed = Number.MAX_SAFE_INTEGER;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < locations.length; i++) {
    const { speed } = locations[i].coords;
    if (speed) {
      if (speed < minSpeed) {
        minSpeed = locations[i].coords.speed as number;
      }
    }
  }
  return minSpeed;
}
