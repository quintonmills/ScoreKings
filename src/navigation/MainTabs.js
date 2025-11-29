import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ContestSelectionScreen from '../screens/ContestSelectionScreen';
import MyContestsScreen from '../screens/MyContests';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#BA0C2F',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name='Home'
        component={ContestSelectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home-outline' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='MyContests'
        component={MyContestsScreen}
        options={{
          title: 'My Contests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='trophy-outline' size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
