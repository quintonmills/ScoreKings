import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // check token on startup
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('token');
        console.log('Stored token:', stored);
        setToken(stored);
      } catch (err) {
        console.log('SecureStore error:', err);
      }
      setLoading(false);
    })();
  }, []);
  async function handleLogin() {
    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        await SecureStore.setItemAsync('token', data.token);
        setToken(data.token);
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('FETCH ERROR:', err);
      alert('Error connecting to server');
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' />
        <Text>Checking login...</Text>
      </View>
    );
  }

  // User is logged in
  if (token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are logged in!</Text>
        <Button title='Logout' onPress={logout} />
      </View>
    );
  }

  // User is not logged in
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder='email'
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder='password'
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title='Login' onPress={handleLogin} />

      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
  },
});
