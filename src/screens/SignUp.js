import React, { useState } from 'react';
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

// Use exact same colors as your LoginScreen
const COLORS = {
  primary: '#1e3f6d',
  secondary: '#BA0C2F',
  background: '#0A1428',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.2)',
  light: '#ffffff',
};

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = new Animated.Value(1);
  const Background = require('../assets/LoginBackground.png');

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

  const handleSignup = async () => {
    animateButton();

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created! Please log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Signup Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={Background} style={styles.backgroundImage}>
      <StatusBar barStyle='light-content' />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.logoText}>SCOREKINGS</Text>
            <View style={styles.accentLine} />
            <Text style={styles.tagline}>CREATE YOUR ACCOUNT</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.boxLabel}>NEW REGISTRATION</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter your email'
                placeholderTextColor='rgba(255,255,255,0.4)'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder='Minimum 6 characters'
                  placeholderTextColor='rgba(255,255,255,0.4)'
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.light}
                    style={{ padding: 10 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder='Repeat password'
                placeholderTextColor='rgba(255,255,255,0.4)'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.light} />
                ) : (
                  <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.linkText}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

// Styles (Exact copy of your LoginScreen styles for consistency)
const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 20, 40, 0.8)' },
  container: { flex: 1, padding: 25, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 30 },
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
  signupButton: {
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

export default SignupScreen;
