import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Dimensions } from 'react-native';
import ContestSelectionScreen from '../screens/ContestSelectionScreen';
import MyContestsScreen from '../screens/MyContests';
import WalletScreen from '../screens/Wallet';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get('window');

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#BA0C2F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 85 : 70, // Increased height
          paddingBottom: Platform.OS === 'ios' ? 25 : 8, // More padding for iOS
          paddingTop: 10,
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11, // Smaller font
          fontWeight: '600',
          marginTop: 2, // Space between icon and text
          marginBottom: Platform.OS === 'ios' ? 0 : 3,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 2, // Space for icon
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={ContestSelectionScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22} // Fixed size instead of dynamic
              color={color}
              style={{ marginBottom: 2 }} // Small margin
            />
          ),
        }}
      />
      <Tab.Screen
        name='MyContests'
        component={MyContestsScreen}
        options={{
          title: 'My Contests',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              size={22}
              color={color}
              style={{ marginBottom: 2 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Wallet'
        component={WalletScreen}
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={22}
              color={color}
              style={{ marginBottom: 2 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
