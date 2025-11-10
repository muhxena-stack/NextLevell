import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen1 from '../screens/OnboardingScreen1';
import OnboardingScreen2 from '../screens/OnboardingScreen2';
import AppTabs from './AppTabs';

export type RootStackParamList = {
    Onboarding1: undefined;
    Onboarding2: undefined;
    AppTabs: undefined; 
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <RootStack.Navigator
      initialRouteName="Onboarding1"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Onboarding1" component={OnboardingScreen1} />
      <RootStack.Screen name="Onboarding2" component={OnboardingScreen2} />
      <RootStack.Screen name="AppTabs" component={AppTabs} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;