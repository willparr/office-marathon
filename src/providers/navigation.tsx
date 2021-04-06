import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { DistanceScreen } from '../screens/distance';
import { MapReviewScreen } from '../screens/mapReview';
import { OnboardingScreen } from '../screens/onboarding';

const Stack = createStackNavigator();

export const NavigationProvider: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Distance" component={DistanceScreen} />
      <Stack.Screen name="MapReview" component={MapReviewScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
