import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// Theme Constants (same as ContestReviewScreen)
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

const PaymentScreen = ({ route, navigation }) => {
  const { contest, picks, potentialPayout } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableBalance] = useState(10000.0); // Mock balance

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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name='chevron-back' size={24} color={COLORS.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CONFIRM ENTRY</Text>
          <Text style={styles.headerSubtitle}>Finalize your contest</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Entry Summary Card */}
        <View style={[styles.summaryCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='ticket-outline' size={24} color={COLORS.primary} />
            <Text style={styles.contestTitle}>{contest.title}</Text>
          </View>

          <View style={styles.picksSection}>
            <Text style={styles.sectionLabel}>YOUR PICKS</Text>
            {picks.map((pick) => (
              <View key={pick.playerId} style={styles.pickRow}>
                <View style={styles.pickInfo}>
                  <Ionicons
                    name='checkmark-circle'
                    size={16}
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
            <Ionicons name='wallet-outline' size={24} color={COLORS.primary} />
            <Text style={styles.paymentTitle}>PAYMENT METHOD</Text>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.methodIconContainer}>
              <Ionicons name='wallet' size={20} color={COLORS.primary} />
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodName}>Virtual Wallet</Text>
              <Text style={styles.methodBalance}>
                Available: ${availableBalance.toFixed(2)}
              </Text>
            </View>
            <Ionicons
              name='checkmark-circle'
              size={20}
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
              size={16}
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
      </View>

      {/* Footer / Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.light} />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='checkmark-circle'
                size={20}
                color={COLORS.light}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmButtonText}>
                SUBMIT ENTRY • ${contest.entryFee}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
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
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickName: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  predictionChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
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
    color: COLORS.gray,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    fontWeight: '700',
  },
  payoutValue: {
    color: COLORS.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    ...TYPOGRAPHY.body,
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
    marginBottom: SPACING.sm,
  },
  termsTitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
  },
  termsText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...CARD_STYLES.shadow,
  },
  confirmButton: {
    width: '100%',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PaymentScreen;
