import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  success: '#28A745',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

const SuccessScreen = ({ navigation, route }) => {
  const payout = route.params?.payout ?? 0;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      handleGoToEntries();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToEntries = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'MyContests' } }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* --- PREMIUM SUCCESS BADGE --- */}
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={[COLORS.success, '#34D399']}
            style={styles.outerCircle}
          >
            <View style={styles.innerCircle}>
              <Ionicons name='checkmark' size={60} color={COLORS.light} />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.statusTitle}>ENTRY CONFIRMED</Text>
        <Text style={styles.statusSubtitle}>
          YOUR PREDICTIONS HAVE BEEN LOCKED IN
        </Text>

        {/* --- PAYOUT CARD (Premium Rounded) --- */}
        <View style={styles.premiumCard}>
          <Text style={styles.boxLabel}>ESTIMATED PAYOUT</Text>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutCurrency}>$</Text>
            <Text style={styles.payoutValue}>{payout.toFixed(2)}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>STATUS</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>PENDING LOCK</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>NETWORK</Text>
              <Text style={styles.metaValue}>V1.0-LIVE</Text>
            </View>
          </View>
        </View>

        {/* --- TRANSACTION LOGS --- */}
        <View style={styles.logsBox}>
          <View style={styles.logItem}>
            <View style={styles.logDot} />
            <Text style={styles.logText}>
              Balance debited from Virtual Wallet.
            </Text>
          </View>
          <View style={styles.logItem}>
            <View style={styles.logDot} />
            <Text style={styles.logText}>Live game feed synchronized.</Text>
          </View>
          <View style={styles.logItem}>
            <View style={styles.logDot} />
            <Text style={styles.logText}>
              Payout verified for final results.
            </Text>
          </View>
        </View>

        {/* --- ACTION BUTTONS --- */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.primaryButton}
            onPress={handleGoToEntries}
          >
            <Text style={styles.primaryButtonText}>VIEW MY ENTRIES</Text>
            <Ionicons
              name='arrow-forward'
              size={18}
              color={COLORS.light}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Contests')}
          >
            <Text style={styles.secondaryButtonText}>RETURN TO LOBBY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.redirectNotice}>
          <ActivityIndicator
            size='small'
            color={COLORS.gray}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.redirectText}>Redirecting to My Contests...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    padding: 24,
  },
  content: { alignItems: 'center', width: '100%' },

  // Success Badge
  badgeContainer: { marginBottom: 24, alignItems: 'center' },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 32,
    textAlign: 'center',
  },

  // Premium Payout Card
  premiumCard: {
    backgroundColor: COLORS.light,
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  payoutCurrency: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
    marginRight: 2,
  },
  payoutValue: { fontSize: 56, fontWeight: '900', color: COLORS.primary },

  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray,
    marginBottom: 6,
  },
  metaValue: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  statusBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
  },

  // Transaction Logs
  logsBox: { width: '100%', marginBottom: 32, paddingHorizontal: 10 },
  logItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  logText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
    marginLeft: 12,
  },

  // Footer
  footer: { width: '100%', gap: 12 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },

  redirectNotice: { flexDirection: 'row', alignItems: 'center', marginTop: 32 },
  redirectText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
  },
});

export default SuccessScreen;
