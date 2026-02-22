import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Imports
import LoginScreen from './src/screens/Login';
import SignupScreen from './src/screens/SignUp';
import MainTabs from './src/navigation/MainTabs';
import PlayerSelection from './src/screens/PlayerSelection';
import ContestReviewScreen from './src/screens/ContestReview';
import PaymentScreen from './src/screens/Payment';
import SuccessScreen from './src/screens/SuccessScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import RedemptionScreen from './src/screens/Redemption'; // <--- NEW IMPORT

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Login'
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* --- AUTH STACK --- */}
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Signup' component={SignupScreen} />

        {/* --- APP CONTENT (Tabs) --- */}
        <Stack.Screen name='MainTabs' component={MainTabs} />

        {/* --- GAMEPLAY & STRATEGY --- */}
        <Stack.Screen name='PlayerSelection' component={PlayerSelection} />
        <Stack.Screen
          name='ContestReviewScreen'
          component={ContestReviewScreen}
        />

        {/* --- REWARDS & SETTINGS --- */}
        <Stack.Screen name='Settings' component={SettingsScreen} />
        <Stack.Screen
          name='RedemptionScreen'
          component={RedemptionScreen}
          options={{
            presentation: 'modal', // Makes it feel like a focused "Shop" experience
          }}
        />

        {/* --- TRANSACTION FLOW --- */}
        <Stack.Screen name='PaymentScreen' component={PaymentScreen} />
        <Stack.Screen
          name='SuccessScreen'
          component={SuccessScreen}
          options={{
            animation: 'fade',
            animationDuration: 1000,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
