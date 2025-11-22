import LoginScreen from './src/screens/login';
import ContestSelectionScreen from './src/screens/ContestSelectionScreen';
import PlayerSelection from './src/screens/PlayerSelection';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ContestReviewScreen from './src/screens/ContestReview';

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
        <Stack.Screen
          name='PlayerSelection'
          component={PlayerSelection}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name='ContestSelectionScreen'
          component={ContestSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ContestReviewScreen'
          component={ContestReviewScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
