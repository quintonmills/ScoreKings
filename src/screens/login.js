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
  Platform,
} from 'react-native';
// import * as LocalAuthentication from 'expo-local-authentication';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const buttonScale = new Animated.Value(1);

  const simulateLogin = () => {
    setIsLoading(true);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ContestSelectionScreen');
    }, 1500);
  };

  const handleLogin = () => {
    // if (!email.trim() || !password.trim()) {
    //     Alert.alert('Error', 'Please fill all fields');
    //     return;
    // }

    // if (!/^\S+@\S+\.\S+$/.test(email)) {
    //     Alert.alert('Error', 'Invalid email format');
    //     return;
    // }

    simulateLogin();
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon`);
  };

  return (
    <ImageBackground style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>ScoreKings</Text>

        <TextInput
          style={styles.input}
          placeholder='Email'
          placeholderTextColor='#fff'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder='Password'
            placeholderTextColor='#fff'
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color='#fff'
            />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>Or login with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Ionicons name='logo-facebook' size={24} color='#fff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name='logo-google' size={24} color='#fff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#000' }]}
              onPress={() => handleSocialLogin('Apple')}
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
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    height: 50,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButton: {
    position: 'absolute',
    right: 15,
  },
  loginButton: {
    backgroundColor: '#BA0C2F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  socialContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  socialText: {
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: '#BA0C2F',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  forgotText: {
    color: '#fff',
    marginTop: 10,
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default LoginScreen;
