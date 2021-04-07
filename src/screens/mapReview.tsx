import React from 'react';
import MapView, { Polyline } from 'react-native-maps';
import { Dimensions } from 'react-native';
import { LocationObject } from 'expo-location';
import haversine from 'haversine';
import { Paragraph, Button, Box } from '../providers/theme';
import { min } from 'react-native-reanimated';

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
  // eslint-disable-next-line no-plusplus
  const maxSpeed = locations
    .map((location) => location.coords.speed ?? Number.MIN_SAFE_INTEGER)
    .reduce((a, b) => Math.max(a, b));
  return maxSpeed;
}

function getMinSpeed(locations: LocationObject[]): number {
  const minSpeed = locations
    .map((location) => location.coords.speed ?? Number.MIN_SAFE_INTEGER)
    .reduce((a, b) => Math.min(a, b));
  return minSpeed;
}
