import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Theme Constants (same as PlayerSelectionScreen)
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

const ContestReviewScreen = ({ route, navigation }) => {
  const { contest, picks } = route.params;

  // Standardizing the multiplier logic for the UI
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
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color={COLORS.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>REVIEW ENTRY</Text>
          <Text style={styles.headerSubtitle}>Confirm your predictions</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contest Info Card */}
        <View style={[styles.contestCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='trophy-outline' size={24} color={COLORS.primary} />
            <Text style={styles.contestTitle}>{contest.title}</Text>
          </View>

          <View style={styles.contestDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name='people-outline' size={16} color={COLORS.gray} />
                <Text style={styles.detailLabel}>Entry Type</Text>
                <Text style={styles.detailValue}>2-Pick Power Play</Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name='time-outline' size={16} color={COLORS.gray} />
                <Text style={styles.detailLabel}>Lock Time</Text>
                <Text style={styles.detailValue}>{contest.endTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your Picks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR PICKS</Text>
          <Text style={styles.sectionCount}>{picks.length}/2</Text>
        </View>

        {picks.map((pick, index) => (
          <View
            key={pick.playerId}
            style={[styles.pickCard, CARD_STYLES.shadow]}
          >
            <View style={styles.pickNumberBadge}>
              <Text style={styles.pickNumberText}>{index + 1}</Text>
            </View>

            <Image source={{ uri: pick.image }} style={styles.playerImage} />

            <View style={styles.pickDetails}>
              <Text style={styles.playerName} numberOfLines={1}>
                {pick.playerName}
              </Text>
              <Text style={styles.playerTeam}>{pick.team}</Text>

              <View style={styles.predictionRow}>
                <View
                  style={[
                    styles.predictionBadge,
                    pick.prediction === 'over'
                      ? styles.overBadge
                      : styles.underBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      pick.prediction === 'over' ? 'arrow-up' : 'arrow-down'
                    }
                    size={14}
                    color={COLORS.light}
                  />
                  <Text style={styles.predictionText}>
                    {pick.prediction === 'over' ? 'OVER' : 'UNDER'}
                  </Text>
                </View>
                <Text style={styles.lineText}>{pick.line} points</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Payout Info Card */}
        <View style={[styles.payoutCard, CARD_STYLES.shadow]}>
          <View style={styles.cardHeader}>
            <Ionicons name='cash-outline' size={24} color={COLORS.primary} />
            <Text style={styles.payoutTitle}>PAYOUT BREAKDOWN</Text>
          </View>

          <View style={styles.payoutDetails}>
            <View style={styles.payoutRow}>
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Entry Fee</Text>
                <Text style={styles.payoutValue}>${contest.entryFee}</Text>
              </View>

              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Multiplier</Text>
                <Text style={styles.multiplierValue}>{multiplier}x</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TO WIN</Text>
              <Text style={styles.totalValue}>${potentialPayout}</Text>
            </View>
          </View>

          <View style={styles.winCondition}>
            <Ionicons
              name='information-circle-outline'
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.winConditionText}>
              Both predictions must be correct to win
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name='create-outline'
            size={18}
            color={COLORS.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.editButtonText}>EDIT SELECTIONS</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={proceedToPayment}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmButtonText}>
              SUBMIT ENTRY • ${contest.entryFee}
            </Text>
            <Ionicons
              name='arrow-forward'
              size={18}
              color={COLORS.light}
              style={{ marginLeft: 8 }}
            />
          </LinearGradient>
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
  contestCard: {
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
  contestDetails: {
    marginTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  detailLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
  },
  sectionCount: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  pickCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pickNumberText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '700',
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
  },
  pickDetails: {
    flex: 1,
  },
  playerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  playerTeam: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overBadge: {
    backgroundColor: COLORS.success,
  },
  underBadge: {
    backgroundColor: COLORS.secondary,
  },
  predictionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.light,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  lineText: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark,
    fontWeight: '700',
  },
  payoutCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  payoutTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  payoutDetails: {
    marginTop: SPACING.sm,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  payoutItem: {
    flex: 1,
    alignItems: 'center',
  },
  payoutLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginBottom: 2,
  },
  payoutValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    fontWeight: '700',
  },
  multiplierValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark,
    fontWeight: '600',
  },
  totalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  winCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.md,
  },
  winConditionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  editButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
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
});

export default ContestReviewScreen;
