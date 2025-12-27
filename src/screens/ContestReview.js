import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerText}>Review Predictions</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Contest Info */}
        <View style={styles.contestCard}>
          <View style={styles.contestHeader}>
            <Ionicons name='stats-chart' size={24} color='#BA0C2F' />
            <Text style={styles.contestTitle}>{contest.title}</Text>
          </View>
          <View style={styles.contestDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entry Type:</Text>
              <Text style={styles.detailValue}>2-Pick Power Play</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Predictions Lock:</Text>
              <Text style={styles.detailValue}>{contest.endTime}</Text>
            </View>
          </View>
        </View>

        {/* Your Picks */}
        <View style={styles.sectionHeader}>
          <Ionicons name='checkmark-circle-outline' size={20} color='#1e3f6d' />
          <Text style={styles.sectionTitle}>YOUR PREDICTIONS</Text>
        </View>

        {picks.map((pick, index) => (
          <View key={pick.playerId} style={styles.pickCard}>
            <Image source={{ uri: pick.image }} style={styles.playerImage} />

            <View style={styles.pickDetails}>
              <Text style={styles.playerName}>{pick.playerName}</Text>
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
                  <Text style={styles.predictionText}>
                    {pick.prediction === 'over' ? 'HIGHER' : 'LOWER'}
                  </Text>
                </View>
                <Text style={styles.lineText}>{pick.line} PTS Projection</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Payout Info */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Ionicons name='flash-outline' size={24} color='#1e3f6d' />
            <Text style={styles.payoutTitle}>EXPECTED PAYOUT</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Entry Amount:</Text>
            <Text style={styles.payoutValue}>${contest.entryFee}</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Payout Multiplier:</Text>
            <Text style={styles.multiplierValue}>{multiplier}x</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.payoutRow}>
            <Text style={styles.totalLabel}>To Win:</Text>
            <Text style={styles.totalValue}>${potentialPayout}</Text>
          </View>

          <View style={styles.winCondition}>
            <Ionicons
              name='information-circle-outline'
              size={18}
              color='#1e3f6d'
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
          <Text style={styles.editButtonText}>EDIT SELECTIONS</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={proceedToPayment}
        >
          <Text style={styles.confirmButtonText}>
            SUBMIT ENTRY (${contest.entryFee})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1e3f6d',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#BA0C2F',
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  contestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contestTitle: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contestDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#1e3f6d',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pickCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  pickNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e3f6d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  pickDetails: {
    flex: 1,
  },
  playerName: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerTeam: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  overBadge: {
    backgroundColor: '#28a745',
  },
  underBadge: {
    backgroundColor: '#BA0C2F',
  },
  predictionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  lineText: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payoutCard: {
    backgroundColor: 'rgba(186, 12, 47, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 12, 47, 0.2)',
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  payoutTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payoutLabel: {
    color: '#666',
    fontSize: 15,
  },
  payoutValue: {
    color: '#1e3f6d',
    fontSize: 15,
    fontWeight: '600',
  },
  multiplierValue: {
    color: '#BA0C2F',
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#BA0C2F',
    fontSize: 22,
    fontWeight: 'bold',
  },
  winCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  winConditionText: {
    color: '#666',
    fontSize: 13,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3f6d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    backgroundColor: '#fff',
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BA0C2F',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#BA0C2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ContestReviewScreen;
