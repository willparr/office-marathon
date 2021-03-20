import { LocationObject } from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';

import {
  Box, Button, Paragraph, Title,
} from '../providers/theme';
import { useLocationData, useLocationTracking } from '../services/location';

export const DistanceScreen: React.FC = () => {
  const locations = useLocationData();
  const tracking = useLocationTracking();
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);

  const startPoint = locations[0];
  const endPoint = useRef<LocationObject | undefined>();

  // determine if current location has passed the start point again
  useEffect(() => {
    if (startPoint?.coords) {
      if (isLocationClose(startPoint, locations[locations.length - 1])) {
        endPoint.current = locations[locations.length - 1];
        setIsCalibrated(true);
      }
    }
  }, [locations]);

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
        {!tracking.isTracking && <Button onPress={tracking.startTracking}>Set Start Point</Button>}
        <Button variant='primary' onPress={tracking.clearTracking}>Reset Calibration</Button>
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

// possibly convert this into a geofence?
function isLocationClose(startPoint: LocationObject, currentPoint: LocationObject) {
  const precision = 0.0001; // about 1.1m

  const isClose = Math.abs(startPoint.coords.latitude - currentPoint.coords.latitude) <= precision
  && Math.abs(startPoint.coords.longitude - currentPoint.coords.longitude) <= precision;
  console.debug(isClose);
  return isClose;
}
