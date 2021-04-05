import { LocationObject } from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';

import {
  Box, Button, Paragraph, Title,
} from '../providers/theme';
import { useLocationData, useLocationTracking } from '../services/location';
import { createGeoFence, isApproachingFinishLine, isHeadingSameDirection, isLocationInGeofence } from '../services/location/track';

export const DistanceScreen: React.FC = () => {
  const locations = useLocationData();
  const tracking = useLocationTracking();
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [insideRange, setInsideRange] = useState<boolean>(false);
  const [directionChanged, setDirectionChanged] = useState<boolean>(false);

  const startPoint = locations[0];
  const endPoint = useRef<LocationObject | undefined>();

  const location = {
    latitude: 30.1325735,
    longitude: -97.6408249,
  };
  const geofence = createGeoFence(location, 10);

  // determine if current location has passed the start point again
  useEffect(() => {
    if (tracking.isTracking && isLocationInGeofence(locations[locations.length - 1], geofence)) {
      setInsideRange(true);
    }
    if (tracking.isTracking && locations.length > 4) {
      const directionChange = !isHeadingSameDirection(locations.slice(-3));
      console.log(directionChange);
      setDirectionChanged(directionChange);
    }
    if (locations.length > 2) {
      const isApproaching = isApproachingFinishLine(
        locations[locations.length - 2],
        locations[locations.length - 1],
        geofence,
      );
    }
  }, [locations.length]);

  return (
    <Box variant='page'>
      <Box>
        <Title>Track Setup</Title>
        {tracking.isTracking
          ? <Paragraph>Calibrating...</Paragraph>
          : <Paragraph>Press start and start driving.</Paragraph>
        }
      </Box>
      <Box variant='column'>
        {insideRange && <Paragraph>Inside Boundary</Paragraph>}
        {!insideRange && <Paragraph>Outside Boundary</Paragraph>}
        {directionChanged && <Paragraph>Direct Changed!</Paragraph>}
        {!directionChanged && <Paragraph>Heading same direction...</Paragraph>}
        {!tracking.isTracking && <Button onPress={tracking.startTracking}>Set Start Point</Button>}
        <Button variant='primary' onPress={() => {
          setInsideRange(false);
          tracking.clearTracking();
        }}>Reset Calibration</Button>
        <Paragraph>Lat: {startPoint?.coords?.latitude}</Paragraph>
        <Paragraph>Lng: {startPoint?.coords?.longitude}</Paragraph>
        {isCalibrated && <>
          <Paragraph>Found Endpoint!</Paragraph>
          <Paragraph>Lat: {startPoint?.coords?.latitude}</Paragraph>
          <Paragraph>Lng: {startPoint?.coords?.longitude}</Paragraph>
          </>
        }

      </Box>
    </Box>
  );
};
