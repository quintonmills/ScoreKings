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
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  success: '#28A745',
  danger: '#FF3B30',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
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
      <StatusBar barStyle='light-content' />

      {/* --- SQUARE GRADIENT HEADER --- */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
              disabled={isProcessing}
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>FINAL SUBMISSION</Text>
              <Text style={styles.headerSubtitle}>TRANSACTION VALIDATION</Text>
            </View>

            <View style={styles.headerSideItem} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ledger Summary Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.boxLabel}>ENTRY SUMMARY</Text>
          <View style={styles.contestRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name='receipt-outline'
                size={18}
                color={COLORS.primary}
              />
            </View>
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
        <View style={styles.premiumCard}>
          <Text style={styles.boxLabel}>FUNDING SOURCE</Text>
          <View style={styles.methodRow}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.methodIcon}
            >
              <Ionicons name='wallet' size={18} color={COLORS.light} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>OTE VIRTUAL WALLET</Text>
              <Text style={styles.methodBalance}>
                AVAILABLE: ${availableBalance.toFixed(2)}
              </Text>
            </View>
            <Ionicons
              name='checkmark-circle'
              size={22}
              color={COLORS.success}
            />
          </View>

          <View style={styles.balanceFooter}>
            <Text style={styles.footerLabel}>POST-TRANSACTION BALANCE</Text>
            <Text style={styles.footerValue}>
              ${(availableBalance - contest.entryFee).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Compliance Footer */}
        <View style={styles.complianceBox}>
          <View style={styles.complianceHeader}>
            <Ionicons name='shield-checkmark' size={14} color={COLORS.gray} />
            <Text style={styles.complianceTitle}>SECURITY PROTOCOL</Text>
          </View>
          <Text style={styles.complianceText}>
            • Secure 256-bit encrypted transaction.{'\n'}• Funds are held in
            escrow until contest finalization.{'\n'}• Entry is subject to
            platform integrity audits.
          </Text>
        </View>
      </ScrollView>

      {/* --- FOOTER ACTION --- */}
      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
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
                <Text style={styles.confirmButtonText}>AUTHORIZE ENTRY</Text>
              </>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Header
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerSideItem: { width: 40 },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  // Premium Rounded Cards
  premiumCard: {
    backgroundColor: COLORS.light,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 16,
  },
  contestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 12,
  },

  // Picks Row
  picksSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pickName: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  predictionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  overBg: { backgroundColor: COLORS.success },
  underBg: { backgroundColor: COLORS.danger },
  predictionText: { color: COLORS.light, fontSize: 11, fontWeight: '800' },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    marginHorizontal: -16,
    marginBottom: -16,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  statItem: { flex: 1 },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.dark },

  // Method Row
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  methodBalance: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },

  balanceFooter: { marginTop: 16, paddingLeft: 4 },
  footerLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray },
  footerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },

  // Compliance
  complianceBox: { padding: 8, marginBottom: 100 },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    marginLeft: 6,
  },
  complianceText: {
    fontSize: 11,
    color: COLORS.gray,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 54,
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
  confirmButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
});

export default PaymentScreen;
