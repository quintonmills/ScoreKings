import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

// Theme Constants
const COLORS = {
  primary: '#1e3f6d',
  secondary: '#BA0C2F',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
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
  md: 12, // Reduced from 16
  lg: 20, // Reduced from 24
  xl: 28, // Reduced from 32
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
};

const PaymentScreen = ({ route, navigation }) => {
  const { contest, picks, potentialPayout } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableBalance] = useState(10000.0);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/contests/${contest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          entryFee: contest.entryFee,
          picks: picks.map((p) => ({
            playerId: p.playerId,
            playerName: p.playerName,
            team: p.team || 'OTE',
            line: p.line,
            prediction: p.prediction,
            stat: 'points',
          })),
        }),
      });
      const result = await response.json();

      if (response.ok) {
        navigation.replace('SuccessScreen', { payout: potentialPayout });
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* Compact Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name='chevron-back' size={22} color={COLORS.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            CONFIRM ENTRY
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Finalize your contest
          </Text>
        </View>
        {/* Empty view for balance */}
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Entry Summary Card */}
        <View style={[styles.summaryCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='ticket-outline' size={20} color={COLORS.primary} />
            <Text style={styles.contestTitle} numberOfLines={1}>
              {contest.title}
            </Text>
          </View>

          <View style={styles.picksSection}>
            <Text style={styles.sectionLabel}>YOUR PICKS</Text>
            {picks.map((pick) => (
              <View key={pick.playerId} style={styles.pickRow}>
                <View style={styles.pickInfo}>
                  <Ionicons
                    name='checkmark-circle'
                    size={14}
                    color={COLORS.success}
                  />
                  <Text style={styles.pickName} numberOfLines={1}>
                    {pick.playerName}
                  </Text>
                </View>
                <View
                  style={[
                    styles.predictionChip,
                    pick.prediction === 'over'
                      ? styles.overChip
                      : styles.underChip,
                  ]}
                >
                  <Text style={styles.predictionText}>
                    {pick.prediction.toUpperCase()} {pick.line}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ENTRY FEE</Text>
              <Text style={styles.statValue}>${contest.entryFee}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TO WIN</Text>
              <Text style={[styles.statValue, styles.payoutValue]}>
                ${potentialPayout}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Card */}
        <View style={[styles.paymentCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='wallet-outline' size={20} color={COLORS.primary} />
            <Text style={styles.paymentTitle} numberOfLines={1}>
              PAYMENT METHOD
            </Text>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.methodIconContainer}>
              <Ionicons name='wallet' size={18} color={COLORS.primary} />
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodName} numberOfLines={1}>
                Virtual Wallet
              </Text>
              <Text style={styles.methodBalance} numberOfLines={1}>
                Available: ${availableBalance.toFixed(2)}
              </Text>
            </View>
            <Ionicons
              name='checkmark-circle'
              size={18}
              color={COLORS.success}
            />
          </View>

          <View style={styles.balanceInfo}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>New Balance:</Text>
              <Text style={styles.balanceValue}>
                ${(availableBalance - contest.entryFee).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsCard}>
          <View style={styles.termsHeader}>
            <Ionicons
              name='information-circle-outline'
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          </View>
          <Text style={styles.termsText}>
            • Entry fee will be deducted from your virtual wallet{'\n'}• Both
            picks must be correct to win the payout{'\n'}• Contest locks at
            specified time, no changes allowed{'\n'}• All decisions are final
          </Text>
        </View>

        {/* Extra spacing for footer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Footer / Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.light} size='small' />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='checkmark-circle'
                size={18}
                color={COLORS.light}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.confirmButtonText} numberOfLines={1}>
                SUBMIT ENTRY • ${contest.entryFee}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 88 : 78, // Reduced height
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.light,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2, // Extra padding for footer
  },
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contestTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  picksSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
  },
  pickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  pickName: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 6,
    flex: 1,
  },
  predictionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  overChip: {
    backgroundColor: COLORS.success,
  },
  underChip: {
    backgroundColor: COLORS.secondary,
  },
  predictionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.light,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: '700',
  },
  payoutValue: {
    color: COLORS.secondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder,
  },
  paymentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  paymentTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  methodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  methodDetails: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  methodName: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodBalance: {
    ...TYPOGRAPHY.small,
    color: COLORS.success,
    fontWeight: '600',
  },
  balanceInfo: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    borderRadius: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  balanceValue: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '700',
  },
  termsCard: {
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xl,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  termsTitle: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  termsText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  confirmButton: {
    width: '100%',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PaymentScreen;
