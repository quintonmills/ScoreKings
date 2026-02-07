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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- ADMIN THEME CONSTANTS ---
const COLORS = {
  primary: '#0A1F44', // Deep Navy
  accent: '#7D1324', // Maroon Stripe
  background: '#F0F2F5',
  cardBg: '#ffffff',
  textMain: '#1A1A1A',
  textMuted: '#65676B',
  success: '#28A745',
  border: '#E4E6EB',
  light: '#ffffff',
};

const SuccessScreen = ({ navigation, route }) => {
  const payout = route.params?.payout ?? 0;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* --- TECHNICAL SUCCESS BADGE --- */}
        <View style={styles.badgeContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name='checkmark' size={50} color={COLORS.light} />
            </View>
          </View>
          <View style={styles.badgeAccent} />
        </View>

        <Text style={styles.statusTitle}>TRANSACTION CONFIRMED</Text>
        <Text style={styles.statusSubtitle}>
          ENTRY LOGGED TO OTE CENTRAL DATABASE
        </Text>

        {/* --- PERFORMANCE RECORD (PAYOUT CARD) --- */}
        <View style={styles.adminBox}>
          <Text style={styles.boxLabel}>ESTIMATED PAYOUT RECORD</Text>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutCurrency}>$</Text>
            <Text style={styles.payoutValue}>{payout.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>STATUS</Text>
              <Text style={[styles.metaValue, { color: COLORS.success }]}>
                PENDING LOCK
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>SYSTEM</Text>
              <Text style={styles.metaValue}>V1.0-AUTH</Text>
            </View>
          </View>
        </View>

        {/* --- SYSTEM LOGS (NEXT STEPS) --- */}
        <View style={styles.logsBox}>
          <View style={styles.logItem}>
            <Ionicons name='radio-button-on' size={12} color={COLORS.accent} />
            <Text style={styles.logText}>
              Balance successfully debited from Virtual Wallet.
            </Text>
          </View>
          <View style={styles.logItem}>
            <Ionicons name='radio-button-on' size={12} color={COLORS.accent} />
            <Text style={styles.logText}>
              Predictions synchronized with live game feed.
            </Text>
          </View>
          <View style={styles.logItem}>
            <Ionicons name='radio-button-on' size={12} color={COLORS.accent} />
            <Text style={styles.logText}>
              Payouts will auto-credit upon stat verification.
            </Text>
          </View>
        </View>

        {/* --- ACTION BUTTONS --- */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToEntries}
          >
            <Text style={styles.primaryButtonText}>OPEN MY ENTRIES</Text>
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
            <Text style={styles.secondaryButtonText}>RETURN TO DASHBOARD</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.redirectNotice}>
          <ActivityIndicator
            size='small'
            color={COLORS.textMuted}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.redirectText}>
            Auto-redirecting to Entry Ledger...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  content: { alignItems: 'center', width: '100%' },

  // Success Badge
  badgeContainer: { marginBottom: 30, alignItems: 'center' },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 2, // Boxy circle
    backgroundColor: COLORS.primary,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeAccent: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.accent,
    marginTop: -2,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 30,
  },

  // Admin Box
  adminBox: {
    backgroundColor: COLORS.cardBg,
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  payoutCurrency: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
    marginRight: 2,
  },
  payoutValue: { fontSize: 48, fontWeight: '900', color: COLORS.primary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  metaGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metaValue: { fontSize: 12, fontWeight: '800', color: COLORS.textMain },

  // Logs Box
  logsBox: { width: '100%', marginBottom: 30 },
  logItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginLeft: 10,
  },

  // Footer
  footer: { width: '100%', gap: 10 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.light,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },

  redirectNotice: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  redirectText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});

export default SuccessScreen;
