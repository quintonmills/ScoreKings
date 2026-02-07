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
import { LinearGradient } from 'expo-linear-gradient';

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
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>REVIEW ENTRY</Text>
              <Text style={styles.headerSubtitle}>FINAL VERIFICATION</Text>
            </View>

            {/* Put the Edit button here instead of an empty view */}
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={{ color: COLORS.light, fontWeight: '700', fontSize: 12 }}
              >
                EDIT
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contest Details Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.boxLabel}>CONTEST DETAILS</Text>
          <View style={styles.contestRow}>
            <View style={styles.iconCircle}>
              <Ionicons name='trophy' size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.contestTitle}>
              {contest.title.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TYPE</Text>
              <Text style={styles.infoValue}>2-PICK POWER</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>LOCK TIME</Text>
              <Text style={styles.infoValue}>{contest.endTime}</Text>
            </View>
          </View>
        </View>

        {/* Picks Section */}
        <Text style={styles.sectionTitle}>PLAYER PREDICTIONS</Text>
        {picks.map((pick) => (
          <View key={pick.playerId} style={styles.pickCard}>
            <View style={styles.pickHeader}>
              <Image source={{ uri: pick.image }} style={styles.playerImage} />
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

        {/* Payout Summary Card */}
        <LinearGradient
          colors={[COLORS.primary, '#162e52']}
          style={styles.payoutCard}
        >
          <Text style={styles.payoutLabel}>ESTIMATED PAYOUT</Text>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutSubLabel}>ENTRY FEE</Text>
              <Text style={styles.payoutValue}>${contest.entryFee}</Text>
            </View>
            <View style={styles.multiplierCircle}>
              <Text style={styles.multiplierText}>{multiplier}X</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.payoutSubLabel}>POTENTIAL WIN</Text>
              <Text style={styles.payoutWinValue}>${potentialPayout}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Edit Action */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='create-outline' size={18} color={COLORS.gray} />
          <Text style={styles.editButtonText}>MODIFY SELECTIONS</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- FOOTER ACTION --- */}
      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={proceedToPayment}
          >
            <Text style={styles.confirmButtonText}>
              SUBMIT ENTRY • ${contest.entryFee}
            </Text>
            <Ionicons
              name='shield-checkmark'
              size={18}
              color={COLORS.light}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Header (Matching Square Style)
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

  content: { flex: 1, padding: 16 },

  // Premium Cards (Rounded 12pt)
  premiumCard: {
    backgroundColor: COLORS.light,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  infoItem: { flex: 1 },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 15,
  },
  infoLabel: { fontSize: 10, color: COLORS.gray, fontWeight: '700' },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },

  // Pick Cards
  pickCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  playerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  playerName: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  playerTeam: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  predictionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overBg: { backgroundColor: COLORS.success },
  underBg: { backgroundColor: COLORS.danger },
  predictionText: { color: COLORS.light, fontSize: 11, fontWeight: '800' },
  pickFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  lineLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray },
  lineValue: { fontSize: 11, fontWeight: '800', color: COLORS.primary },

  // Payout Card
  payoutCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  payoutLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 15,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutSubLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  payoutValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.light,
    marginTop: 4,
  },
  payoutWinValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#4ADE80', // Brighter green for contrast on dark
    marginTop: 2,
  },
  multiplierCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  multiplierText: { color: COLORS.light, fontWeight: '900', fontSize: 16 },

  // Buttons
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 60,
  },
  editButtonText: {
    color: COLORS.gray,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    marginLeft: 8,
  },
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

export default ContestReviewScreen;
