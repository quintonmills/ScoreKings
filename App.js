import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Imports
import LoginScreen from './src/screens/Login';
import SignupScreen from './src/screens/SignUp'; // <--- New Import
import MainTabs from './src/navigation/MainTabs';
import PlayerSelection from './src/screens/PlayerSelection';
import ContestReviewScreen from './src/screens/ContestReview';
import PaymentScreen from './src/screens/Payment';
import SuccessScreen from './src/screens/SuccessScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Login'
        screenOptions={{
          headerShown: false, // Applies to all screens unless overridden
          animation: 'slide_from_right', // Native iOS/Android feel
        }}
      >
        {/* --- AUTH STACK --- */}
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Signup' component={SignupScreen} />

        {/* --- APP CONTENT (Tabs) --- */}
        <Stack.Screen name='MainTabs' component={MainTabs} />

        {/* --- GAMEPLAY & MODALS --- */}
        <Stack.Screen name='PlayerSelection' component={PlayerSelection} />
        <Stack.Screen
          name='ContestReviewScreen'
          component={ContestReviewScreen}
        />
        <Stack.Screen name='PaymentScreen' component={PaymentScreen} />
        <Stack.Screen name='Settings' component={SettingsScreen} />
        <Stack.Screen
          name='SuccessScreen'
          component={SuccessScreen}
          options={{
            animation: 'fade', // Smoother transition for the win
            animationDuration: 1000,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
