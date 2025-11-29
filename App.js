import LoginScreen from './src/screens/login';
import PlayerSelection from './src/screens/PlayerSelection';
import ContestReviewScreen from './src/screens/ContestReview';
import PaymentScreen from './src/screens/Payment';
import MainTabs from './src/navigation/MainTabs';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* After login, go into Tabs */}
        <Stack.Screen
          name='MainTabs'
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* These stay above tabs */}
        <Stack.Screen
          name='PlayerSelection'
          component={PlayerSelection}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ContestReviewScreen'
          component={ContestReviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='PaymentScreen'
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
