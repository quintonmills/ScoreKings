import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';

const SuccessScreen = ({ navigation }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1. Start the Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800, // Slightly slower fade-in
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. ONLY AFTER animation finishes:
      setShowConfetti(true); // Start the party

      // 3. START the countdown now (4 seconds of "glory time")
      setTimeout(() => {
        handleGoToEntries();
      }, 4000);
    });
  }, []);

  const handleGoToEntries = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'MyContests' } }],
    });
  };

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          fallSpeed={3500}
        />
      )}

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name='lock-closed' size={60} color='#fff' />
        </View>

        <Text style={styles.title}>LOCKED IN! 🔒</Text>
        <Text style={styles.subtitle}>
          Your picks are registered for the local showdown.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoToEntries}>
          <Text style={styles.buttonText}>VIEW MY ENTRIES NOW</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3f6d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10, // Ensure text is above confetti
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#28a745',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e0',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#BA0C2F',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SuccessScreen;
