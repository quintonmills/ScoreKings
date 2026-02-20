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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#BA0C2F',
  background: '#0A1428',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.2)',
  light: '#ffffff',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = new Animated.Value(1);
  const Background = require('../assets/LoginBackground.png');

  // useEffect(() => {
  //   const checkExistingSession = async () => {
  //     const token = await AsyncStorage.getItem('userToken');
  //     if (token) {
  //       navigation.replace('MainTabs');
  //     }
  //   };
  //   checkExistingSession();
  // }, []);

  useEffect(() => {
    const clearAuth = async () => {
      await AsyncStorage.clear(); // This wipes EVERYTHING stored locally
      console.log('Storage Cleared');
    };
    clearAuth();
  });

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

  const handleLogin = async () => {
    animateButton();

    // DEVELOPER BACKDOOR FOR APPLE REVIEWERS
    if (email.toLowerCase() === 'admin' && password === 'admin') {
      await AsyncStorage.setItem('userToken', 'dev-bypass-token');
      await AsyncStorage.setItem('userId', '1');
      navigation.replace('MainTabs');
      return;
    }

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
        'Check your internet connection or server status',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={Background} style={styles.backgroundImage}>
      <StatusBar barStyle='light-content' />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.logoText}>SCOREKINGS</Text>
            <View style={styles.accentLine} />
            <Text style={styles.tagline}>ELITE PREDICTION PLATFORM</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.boxLabel}>SECURE LOGIN</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IDENTIFIER</Text>
              <TextInput
                style={styles.input}
                placeholder='Email or "admin"'
                placeholderTextColor='rgba(255,255,255,0.4)'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SECURITY KEY</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder='Password'
                  placeholderTextColor='rgba(255,255,255,0.4)'
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
                    size={20}
                    color={COLORS.light}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.light} />
                ) : (
                  <Text style={styles.buttonText}>LOGIN</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.linkText}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 20, 40, 0.8)' },
  container: { flex: 1, padding: 25, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.light,
    letterSpacing: 4,
  },
  accentLine: {
    width: 50,
    height: 4,
    backgroundColor: COLORS.secondary,
    marginVertical: 8,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  formContainer: {
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    color: COLORS.light,
    fontSize: 15,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    color: COLORS.light,
    fontSize: 15,
  },
  eyeIcon: { padding: 10 },
  loginButton: {
    backgroundColor: COLORS.secondary,
    height: 55,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: {
    color: COLORS.light,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: COLORS.light, fontSize: 14, opacity: 0.8 },
  linkText: { color: COLORS.secondary, fontWeight: 'bold' },
});

export default LoginScreen;
