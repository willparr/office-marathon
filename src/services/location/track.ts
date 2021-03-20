import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { ReloadInstructions } from 'react-native/Libraries/NewAppScreen';
import { addLocation, getLocations } from './storage';

/**
 * The unique name of the background location task.
 */
export const locationTaskName = 'office-marathon';

/**
 * Check if the background location is started and running.
 * This is a wrapper around `Location.hasStartedLocationUpdatesAsync` with the task name prefilled.
 */
export async function isTracking(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(locationTaskName);
}

/**
 * Start the background location monitoring and add new locations to the storage.
 * This is a wrapper around `Location.startLocationUpdatesAsync` with the task name prefilled.
 */
export async function startTracking() {
  await Location.startLocationUpdatesAsync(locationTaskName, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    // android behavior
    foregroundService: {
      notificationTitle: 'Office marathon is active',
      notificationBody: 'Monitoring your location to measure total distance',
      notificationColor: '#333333',
    },
    // ios behavior
    activityType: Location.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
  });
  console.debug('[tracking]', 'started background location task');
}

/**
 * Stop the background location monitoring.
 * This is a wrapper around `Location.stopLocationUpdatesAsync` with the task name prefilled.
 */
export async function stopTracking() {
  await Location.stopLocationUpdatesAsync(locationTaskName);
  console.debug('[tracking]', 'stopped background location task');
}

type Location = {
  latitude: number
  longitude: number
}

// Get the radius in meters
// Calculate the sensitivity
// 11.1 m = 0.0001 degrees

// create circular geofence? don't know which way track is facing
type CircleGeofence = {
  center: Location,
  radius: number
}

function between(num: number, min: number, max: number): boolean {
  return num > min && num < max;
}

export function createGeoFence(location: Location, radius: number): CircleGeofence {
  const convertedRadius = radius * (0.0001 / 11.1);
  return {
    center: location,
    radius: convertedRadius,
  };
}

export function isLocationInGeofence(location: Location.LocationObject, geofence: CircleGeofence) {
  // is it within the lat boundaries?
  // eslint-disable-next-line max-len

  console.log(location.coords.latitude);
  console.log(geofence.center.latitude - geofence.radius);
  console.log(geofence.center.latitude + geofence.radius);
  console.log(geofence.radius);

  // eslint-disable-next-line max-len
  if (between(location.coords.latitude, geofence.center.latitude - geofence.radius, geofence.center.latitude + geofence.radius)
    // eslint-disable-next-line max-len
    && between(location.coords.longitude, geofence.center.longitude - geofence.radius, geofence.center.longitude + geofence.radius)) {
    console.log('true');
    return true;
  }
  return false;
}

/**
 * Define the background task that's adding locations to the storage.
 * This method isn't "directly" connected to React, that's why we store the data locally.
 */
TaskManager.defineTask(locationTaskName, async (event) => {
  if (event.error) {
    return console.error('[tracking]', 'Something went wrong within the background location task...', event.error);
  }

  const locations = (event.data as any).locations as Location.LocationObject[];
  console.debug('[tracking]', 'Received new locations', locations);

  try {
    // have to add it sequentially, parses/serializes existing JSON
    for (const location of locations) {
      await addLocation(location);
    }
  } catch (error) {
    console.debug('[tracking]', 'Something went wrong when saving a new location...', error);
  }
});
