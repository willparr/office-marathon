import { LocationObject } from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';

import {
  Box, Button, Paragraph, Title,
} from '../providers/theme';
import { useLocationData, useLocationTracking } from '../services/location';

export const DistanceScreen: React.FC = () => {
  const locations = useLocationData();
  const tracking = useLocationTracking();

  const startPoint = locations[0];

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
        {tracking.isTracking
          ? <Button onPress={tracking.stopTracking}>Reset Calibration</Button>
          : <Button onPress={tracking.startTracking}>Set Start Point</Button>
        }
        <Button variant='primary' onPress={tracking.clearTracking}>Reset Calibration</Button>
        <Paragraph>Lat: {startPoint?.coords?.latitude}</Paragraph>
        <Paragraph>Lng: {startPoint?.coords?.longitude}</Paragraph>
      </Box>
    </Box>
  );
};

