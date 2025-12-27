import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = new Animated.Value(1);
  const Background = require('../assets/LoginBackground.png');

  // 1. AUTO-LOGIN LOGIC
  // Checks if a token exists when the app opens to skip the login screen
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        navigation.replace('MainTabs');
      }
    };
    checkExistingSession();
  }, []);

  // 2. ANIMATION HELPER
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 3. ACTUAL LOGIN LOGIC
  const handleLogin = async () => {
    animateButton();

    // DEVELOPER BACKDOOR
    if (email.toLowerCase() === 'admin' && password === 'admin') {
      await AsyncStorage.setItem('userToken', 'dev-bypass-token');
      await AsyncStorage.setItem('userId', '1');
      navigation.replace('MainTabs');
      return;
    }

    // VALIDATION
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Persist the session
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.user.id.toString());

        navigation.replace('MainTabs');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert(
        'Network Error',
        'Check your internet connection or server status'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={Background} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>ScoreKings</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder='Email or "admin"'
            placeholderTextColor='rgba(255,255,255,0.7)'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder='Password'
              placeholderTextColor='rgba(255,255,255,0.7)'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color='#fff'
              />
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.buttonText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>Or login with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#4267B2' }]}
            >
              <Ionicons name='logo-facebook' size={24} color='#fff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#DB4437' }]}
            >
              <Ionicons name='logo-google' size={24} color='#fff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#000' }]}
            >
              <Ionicons name='logo-apple' size={24} color='#fff' />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.linkText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 50,
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formContainer: { width: '100%' },
  input: {
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 25,
  },
  passwordInput: {
    flex: 1,
    height: 55,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: { padding: 10, marginRight: 5 },
  loginButton: {
    backgroundColor: '#BA0C2F',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  socialContainer: { marginTop: 40, alignItems: 'center' },
  socialText: { color: '#fff', marginBottom: 20, opacity: 0.8 },
  socialButtons: { flexDirection: 'row', justifyContent: 'center' },
  socialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 14 },
  linkText: { color: '#BA0C2F', fontWeight: 'bold' },
});

export default LoginScreen;
