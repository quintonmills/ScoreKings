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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ensure this is installed
import { API_URL } from '../config/api';

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
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = new Animated.Value(1);
  const Background = require('../assets/LoginBackground.png');

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS stays open in modal style
    if (selectedDate) {
      setDob(selectedDate);
      setHasSelectedDate(true);
    }
  };

  const handleSignup = async () => {
    // 1. Basic Validation
    if (!email || !password || !confirmPassword || !hasSelectedDate) {
      Alert.alert(
        'Required',
        'Please fill in all fields, including Date of Birth.',
      );
      return;
    }

    // 2. Age Gate Logic (18+)
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      Alert.alert(
        'Access Denied',
        'You must be at least 18 years old to join ScoreKings.',
      );
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
          dob: dob.toISOString(), // Send as ISO string for Prisma
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Server Error');
      }

      if (response.ok) {
        Alert.alert('Success', 'Account created! Please log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Signup Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Connection failed. Please check your internet.',
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

            {/* AGE GATE INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DATE OF BIRTH (MUST BE 18+)</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={{
                    color: hasSelectedDate
                      ? COLORS.light
                      : 'rgba(255,255,255,0.4)',
                    marginTop: 14,
                  }}
                >
                  {hasSelectedDate
                    ? dob.toDateString()
                    : 'Select your birthday'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode='date'
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()} // Can't be born in the future
                />
              )}
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

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.light} />
              ) : (
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 20, 40, 0.8)' },
  container: { flex: 1, padding: 25, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 20 },
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
    marginBottom: 15,
  },
  inputGroup: { marginBottom: 12 },
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
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: COLORS.light, fontSize: 14, opacity: 0.8 },
  linkText: { color: COLORS.secondary, fontWeight: 'bold' },
});

export default SignupScreen;
