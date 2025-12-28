import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

// Theme Constants (same as PaymentScreen)
const COLORS = {
  primary: '#1e3f6d', // Dark blue
  secondary: '#BA0C2F', // Red
  success: '#34C759', // Green
  warning: '#FF9500', // Orange
  danger: '#FF3B30', // Red
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  lightGray: '#F5F5F7',
  cardBg: '#ffffff',
  cardBorder: '#E5E5EA',
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
};

const SuccessScreen = ({ navigation, route }) => {
  // Safe extraction of payout
  const payout = route.params?.payout ?? 0;

  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 1. Start Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Trigger Confetti
      setShowConfetti(true);

      // 3. Auto-redirect after 4 seconds
      const timer = setTimeout(() => {
        handleGoToEntries();
      }, 4000);

      return () => clearTimeout(timer);
    });
  }, []);

  const handleGoToEntries = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'MyContests' } }],
    });
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, '#2A5298']}
      style={styles.container}
    >
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fallSpeed={3000}
          fadeOut={true}
        />
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Success Icon */}
        <LinearGradient
          colors={[COLORS.success, '#28a745']}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <Ionicons name='checkmark-circle' size={60} color={COLORS.light} />
          </View>
        </LinearGradient>

        {/* Success Title */}
        <Text style={styles.title}>ENTRY CONFIRMED!</Text>
        <Text style={styles.subtitle}>
          Your contest entry has been successfully submitted
        </Text>

        {/* Payout Card */}
        <Animated.View style={[styles.payoutCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='trophy-outline' size={24} color={COLORS.primary} />
            <Text style={styles.payoutTitle}>POTENTIAL PAYOUT</Text>
          </View>

          <View style={styles.payoutContent}>
            <Text style={styles.payoutLabel}>ESTIMATED WINNINGS</Text>
            <Text style={styles.payoutValue}>${payout}</Text>
            <Text style={styles.payoutNote}>
              Both picks must be correct to win
            </Text>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <View style={styles.stepsCard}>
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Ionicons name='time-outline' size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.stepText}>Contest will lock at game time</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Ionicons
                name='notifications-outline'
                size={20}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.stepText}>
              Results will be updated automatically
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Ionicons
                name='wallet-outline'
                size={20}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.stepText}>
              Winnings will be added to your wallet
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToEntries}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='list-circle'
                size={20}
                color={COLORS.light}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.primaryButtonText}>VIEW MY ENTRIES</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Contests')}
            activeOpacity={0.8}
          >
            <Ionicons
              name='add-circle-outline'
              size={20}
              color={COLORS.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryButtonText}>JOIN ANOTHER CONTEST</Text>
          </TouchableOpacity>
        </View>

        {/* Auto Redirect Notice */}
        <View style={styles.redirectNotice}>
          <Ionicons
            name='information-circle-outline'
            size={16}
            color='rgba(255, 255, 255, 0.7)'
          />
          <Text style={styles.redirectText}>
            Redirecting to My Entries in a few seconds...
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    zIndex: 10,
  },
  iconContainer: {
    borderRadius: 75,
    padding: 6,
    marginBottom: SPACING.xl,
    ...CARD_STYLES.shadow,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 24,
  },
  payoutCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  payoutTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  payoutContent: {
    alignItems: 'center',
  },
  payoutLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  payoutValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.secondary,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  payoutNote: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  stepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    width: '100%',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  redirectNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: 6,
  },
  redirectText: {
    ...TYPOGRAPHY.small,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
});

export default SuccessScreen;
