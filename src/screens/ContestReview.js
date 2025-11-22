import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ContestReviewScreen = ({ route, navigation }) => {
  const { player1, player2, stat } = route.params;

  // Determine winner based on stat
  const winner = player1[stat] > player2[stat] ? player1 : player2;
  const statName = stat.toUpperCase();

  const proceedToPayment = () => {
    navigation.navigate('PaymentScreen', {
      player1,
      player2,
      stat,
      entryFee: 10.0,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerText}>Matchup</Text>
      </View>

      <View style={styles.content}>
        {/* Stat being compared */}
        <View style={styles.statBanner}>
          <Text style={styles.statText}>Comparing: {statName}</Text>
        </View>

        {/* Players comparison */}
        <View style={styles.playersRow}>
          {/* Player 1 Card */}
          <View style={styles.playerCard}>
            <Image source={{ uri: player1.image }} style={styles.playerImage} />
            <Text style={styles.playerName}>{player1.name}</Text>
            <Text style={styles.playerTeam}>{player1.team}</Text>
            <Text style={styles.statValue}>{player1[stat]}</Text>
          </View>

          {/* VS Separator */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Player 2 Card */}
          <View style={styles.playerCard}>
            <Image source={{ uri: player2.image }} style={styles.playerImage} />
            <Text style={styles.playerName}>{player2.name}</Text>
            <Text style={styles.playerTeam}>{player2.team}</Text>
            <Text style={styles.statValue}>{player2[stat]}</Text>
          </View>
        </View>

        {/* Winner banner */}
        <View style={styles.winnerBanner}>
          <Ionicons name='trophy' size={24} color='#FFD700' />
          <Text style={styles.winnerText}>
            {winner.name} leads in {statName}
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={proceedToPayment}
        >
          <Text style={styles.continueButtonText}>CONTINUE TO PAYMENT</Text>
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
  statBanner: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  statText: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginHorizontal: 5,
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#1e3f6d',
    marginBottom: 10,
  },
  playerName: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerTeam: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#BA0C2F',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  vsText: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 12, 47, 0.2)',
  },
  winnerText: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#BA0C2F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default ContestReviewScreen;
