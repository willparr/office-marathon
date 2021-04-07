import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import haversine from 'haversine';
import { addLocation } from './storage';

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
  const isBetween = num > min && num < max;
  return isBetween;
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

  // eslint-disable-next-line max-len
  if (between(location.coords.latitude, geofence.center.latitude - geofence.radius, geofence.center.latitude + geofence.radius)
    // eslint-disable-next-line max-len
    && between(location.coords.longitude, geofence.center.longitude - geofence.radius, geofence.center.longitude + geofence.radius)) {
    console.log('User inside boundary\n\n\n\n');
    return true;
  }
  return false;
}

export function didUserCrossFinishLine(locations: Location.LocationObject[]) {
  // Is the user heading the same direction this entire way?
  isHeadingSameDirection(locations);

  // Is the user approaching the finish line in this location array?
}

// This is should be called when the user starts heading towards the finish line
export function isHeadingSameDirection(locations: Location.LocationObject[]): boolean {
  const tolerance = 45;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < locations.length - 1; i++) {
    const location = locations[i];
    const nextLocation = locations[i + 1];
    if (!location.coords.heading || !nextLocation.coords.heading) {
      return false;
    }
    const result = Math.abs(location.coords.heading - nextLocation.coords.heading);
    console.debug(result);
    if (result > tolerance) {
      console.debug('\n');
      return false;
    }
  }
  console.debug('\n');
  return true;
}

// Calculate the destination point given distance and bearing from the start point
// 20 meters is the tolerance
export function predictUserDirection(location: Location.LocationObject): Location | undefined {
  if (!location.coords.heading) {
    return undefined;
  }
  const tolerance = 20;
  const earthRadius = 6371000;

  // const lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
  //                     Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
  const latRadians = toRadians(location.coords.latitude);
  const lngRadians = toRadians(location.coords.longitude);
  const headingRadians = toRadians(location.coords.heading);

  const predictLat = Math.asin(Math.sin(latRadians)
  * Math.cos(tolerance / earthRadius)
  + Math.cos(latRadians)
  * Math.sin(tolerance / earthRadius) * Math.cos(headingRadians));

  const predictLng = lngRadians
  + Math.atan2(Math.sin(headingRadians)
  * Math.sin(tolerance / earthRadius)
  * Math.cos(latRadians),
  Math.cos(tolerance / earthRadius)
  - Math.sin(latRadians) * Math.sin(predictLat));

  return { latitude: toDegrees(predictLat), longitude: toDegrees(predictLng) };
}

function toRadians(degrees: number): number {
  return degrees * (3.14 / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / 3.14);
}

// Need to figure out how to determine we crossed the finished line if we missed a gps point
// If they are approaching the finish line (probably determine a threshold as well)
// And if they are in the geofence
// then check if the next locations are traveling away from the geofence
// record the lap time if we missed the gps point

export function isApproachingFinishLine(
  prevLocation: Location.LocationObject,
  location: Location.LocationObject,
  geofence: CircleGeofence,
) {
  const prevDistance = haversine(prevLocation.coords, geofence.center, { unit: 'meter' });
  const nextDistance = haversine(location.coords, geofence.center, { unit: 'meter' });

  console.log('[nextDistance]: ', nextDistance);

  return prevDistance > nextDistance && nextDistance < 100;
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

  try {
    // have to add it sequentially, parses/serializes existing JSON
    for (const location of locations) {
      await addLocation(location);
    }
  } catch (error) {
    console.debug('[tracking]', 'Something went wrong when saving a new location...', error);
  }
});
