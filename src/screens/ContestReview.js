import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
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
  danger: '#DC3545',
  border: '#E4E6EB',
  light: '#ffffff',
};

const ContestReviewScreen = ({ route, navigation }) => {
  const { contest, picks } = route.params;

  const multiplier = 3;
  const potentialPayout = contest.entryFee * multiplier;

  const proceedToPayment = () => {
    navigation.navigate('PaymentScreen', {
      contest,
      picks,
      potentialPayout,
    });
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
            >
              <Ionicons name='chevron-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>REVIEW ENTRY</Text>
              <Text style={styles.headerSubtitle}>FINAL VERIFICATION</Text>
            </View>

            <View style={styles.headerSideItem} />
          </View>
        </SafeAreaView>
        <View style={styles.headerAccentLine} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contest Box */}
        <View style={styles.adminBox}>
          <Text style={styles.boxLabel}>CONTEST DETAILS</Text>
          <View style={styles.contestRow}>
            <Ionicons name='trophy' size={20} color={COLORS.primary} />
            <Text style={styles.contestTitle}>
              {contest.title.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TYPE</Text>
              <Text style={styles.infoValue}>2-PICK POWER</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>LOCK TIME</Text>
              <Text style={styles.infoValue}>{contest.endTime}</Text>
            </View>
          </View>
        </View>

        {/* Picks Section */}
        <Text style={styles.sectionTitle}>PLAYER PREDICTIONS</Text>
        {picks.map((pick, index) => (
          <View key={pick.playerId} style={styles.pickCard}>
            <View style={styles.pickHeader}>
              <View style={styles.playerCircle}>
                <Image
                  source={{ uri: pick.image }}
                  style={styles.playerImage}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>
                  {pick.playerName.toUpperCase()}
                </Text>
                <Text style={styles.playerTeam}>{pick.team}</Text>
              </View>
              <View
                style={[
                  styles.predictionBadge,
                  pick.prediction === 'over' ? styles.overBg : styles.underBg,
                ]}
              >
                <Text style={styles.predictionText}>
                  {pick.prediction.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.pickFooter}>
              <Text style={styles.lineLabel}>STAT LINE</Text>
              <Text style={styles.lineValue}>{pick.line} POINTS</Text>
            </View>
          </View>
        ))}

        {/* Payout Box */}
        <View style={styles.payoutBox}>
          <Text style={styles.boxLabel}>ESTIMATED PAYOUT</Text>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutSubLabel}>ENTRY FEE</Text>
              <Text style={styles.payoutMainValue}>${contest.entryFee}</Text>
            </View>
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>{multiplier}X</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.payoutSubLabel}>TO WIN</Text>
              <Text style={[styles.payoutMainValue, { color: COLORS.success }]}>
                ${potentialPayout}
              </Text>
            </View>
          </View>
          <View style={styles.accentBar} />
        </View>

        {/* Edit Action */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='create-outline' size={18} color={COLORS.textMuted} />
          <Text style={styles.editButtonText}>MODIFY SELECTIONS</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- FOOTER ACTION --- */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={proceedToPayment}
        >
          <Text style={styles.confirmButtonText}>
            SUBMIT ENTRY • ${contest.entryFee}
          </Text>
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

  content: { flex: 1, padding: 16 },

  // Admin Style Boxes
  adminBox: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    borderRadius: 2,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  contestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contestTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    marginLeft: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700' },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },

  // Pick Cards
  pickCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  pickHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  playerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    marginRight: 12,
    overflow: 'hidden',
  },
  playerImage: { width: '100%', height: '100%' },
  playerName: { fontSize: 13, fontWeight: '800', color: COLORS.textMain },
  playerTeam: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  predictionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  overBg: { backgroundColor: COLORS.success },
  underBg: { backgroundColor: COLORS.danger },
  predictionText: { color: COLORS.light, fontSize: 10, fontWeight: '900' },
  pickFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#FAFBFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lineLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },
  lineValue: { fontSize: 10, fontWeight: '800', color: COLORS.primary },

  // Payout Box
  payoutBox: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 20,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutSubLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
  },
  payoutMainValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.light,
    marginTop: 4,
  },
  multiplierBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
  },
  multiplierText: { color: COLORS.light, fontWeight: '900', fontSize: 14 },
  accentBar: {
    height: 3,
    backgroundColor: COLORS.accent,
    width: 40,
    marginTop: 15,
  },

  // Buttons
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 40,
  },
  editButtonText: {
    color: COLORS.textMuted,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    marginLeft: 8,
  },
  footer: {
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 2,
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

export default ContestReviewScreen;
