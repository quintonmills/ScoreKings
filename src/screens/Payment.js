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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

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
  danger: '#DC3545',
  border: '#E4E6EB',
  light: '#ffffff',
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
        Alert.alert('Submission Error', result.error || 'Check system logs.');
      }
    } catch (err) {
      Alert.alert('System Error', 'Connection failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* --- BOXY CENTERED HEADER --- */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
              disabled={isProcessing}
            >
              <Ionicons name='chevron-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>FINAL SUBMISSION</Text>
              <Text style={styles.headerSubtitle}>TRANSACTION VALIDATION</Text>
            </View>

            <View style={styles.headerSideItem} />
          </View>
        </SafeAreaView>
        <View style={styles.headerAccentLine} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ledger Summary Card */}
        <View style={styles.adminBox}>
          <Text style={styles.boxLabel}>ENTRY SUMMARY</Text>
          <View style={styles.contestRow}>
            <Ionicons name='receipt-outline' size={18} color={COLORS.primary} />
            <Text style={styles.contestTitle}>
              {contest.title.toUpperCase()}
            </Text>
          </View>

          <View style={styles.picksSection}>
            {picks.map((pick) => (
              <View key={pick.playerId} style={styles.pickRow}>
                <Text style={styles.pickName}>
                  {pick.playerName.toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.predictionBadge,
                    pick.prediction === 'over' ? styles.overBg : styles.underBg,
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
              <Text style={styles.statLabel}>DEBIT AMOUNT</Text>
              <Text style={styles.statValue}>
                ${contest.entryFee.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>POTENTIAL CREDIT</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                ${potentialPayout.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Account Box */}
        <View style={styles.adminBox}>
          <Text style={styles.boxLabel}>FUNDING SOURCE</Text>
          <View style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Ionicons name='wallet' size={20} color={COLORS.light} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>OTE VIRTUAL WALLET</Text>
              <Text style={styles.methodBalance}>
                CURRENT: ${availableBalance.toFixed(2)}
              </Text>
            </View>
            <Ionicons
              name='checkmark-circle'
              size={20}
              color={COLORS.success}
            />
          </View>

          <View style={styles.balanceFooter}>
            <Text style={styles.footerLabel}>
              ESTIMATED POST-TRANSACTION BALANCE
            </Text>
            <Text style={styles.footerValue}>
              ${(availableBalance - contest.entryFee).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Compliance Footer */}
        <View style={styles.complianceBox}>
          <View style={styles.complianceHeader}>
            <Ionicons
              name='shield-checkmark'
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.complianceTitle}>SYSTEM TERMS</Text>
          </View>
          <Text style={styles.complianceText}>
            • Transaction is irreversible once submitted.{'\n'}• Winning
            distributions are processed upon contest finalization.{'\n'}•
            Account will be audited for compliance with platform rules.
          </Text>
        </View>
      </ScrollView>

      {/* --- FOOTER ACTION --- */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && { opacity: 0.7 }]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.light} size='small' />
          ) : (
            <>
              <Ionicons
                name='lock-closed'
                size={16}
                color={COLORS.light}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmButtonText}>
                AUTHORIZE ENTRY • ${contest.entryFee.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  headerWrapper: { backgroundColor: COLORS.primary, zIndex: 100 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  headerAccentLine: { height: 4, backgroundColor: COLORS.accent },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  // Admin Style Boxes
  adminBox: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    borderRadius: 2,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  contestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contestTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginLeft: 8,
  },

  // Picks Row
  picksSection: { marginBottom: 16 },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  pickName: { fontSize: 12, fontWeight: '700', color: COLORS.textMain },
  predictionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  overBg: { backgroundColor: COLORS.success },
  underBg: { backgroundColor: COLORS.danger },
  predictionText: { color: COLORS.light, fontSize: 10, fontWeight: '900' },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1 },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: COLORS.textMain },

  // Method Row
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodIcon: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: { fontSize: 12, fontWeight: '800', color: COLORS.textMain },
  methodBalance: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '700',
    marginTop: 2,
  },

  balanceFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },
  footerValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },

  // Compliance
  complianceBox: { padding: 8, marginBottom: 40 },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  complianceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Footer
  footer: {
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: COLORS.light,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default PaymentScreen;
