export default function App() {
  const components = {
    LoginScreen,
    PlayerSelection,
    ContestReviewScreen,
    PaymentScreen,
    MainTabs,
  };

  const missing = Object.entries(components)
    .filter(([name, comp]) => !comp)
    .map(([name]) => name);

  if (missing.length > 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          CRITICAL ERROR
        </Text>
        <Text style={{ color: 'white' }}>
          The following imports are UNDEFINED:
        </Text>
        {missing.map((name) => (
          <Text key={name} style={{ color: 'yellow' }}>
            - {name}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='MainTabs'
          component={MainTabs}
          options={{ headerShown: false }}
        />
        {/* ... rest of your screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
