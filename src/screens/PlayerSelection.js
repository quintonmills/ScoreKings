import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const PlayerSelection = ({ navigation, route }) => {
  const { contest } = route.params;
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState([]);

  // Fetch player props for this contest
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/contests/${contest.id}/props`
        );
        const data = await response.json();
        setProps(data);
      } catch (error) {
        console.error('Error fetching props:', error);
        Alert.alert('Error', 'Failed to load player props');
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [contest.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name='chevron-back' size={24} color='#fff' />
          </TouchableOpacity>
          <Text style={styles.headerText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const handlePickSelection = (prop, prediction) => {
    const existingPickIndex = picks.findIndex(
      (p) => p.playerId === prop.playerId
    );

    if (existingPickIndex !== -1) {
      // Update existing pick
      const newPicks = [...picks];
      newPicks[existingPickIndex] = {
        playerId: prop.playerId,
        playerName: prop.playerName,
        team: prop.team,
        stat: prop.stat,
        line: prop.line,
        prediction: prediction,
        image: prop.image,
      };
      setPicks(newPicks);
    } else if (picks.length < 2) {
      // Add new pick
      setPicks([
        ...picks,
        {
          playerId: prop.playerId,
          playerName: prop.playerName,
          team: prop.team,
          stat: prop.stat,
          line: prop.line,
          prediction: prediction,
          image: prop.image,
        },
      ]);
    } else {
      Alert.alert('Limit Reached', 'You can only select 2 players');
    }
  };

  const removePick = (playerId) => {
    setPicks(picks.filter((p) => p.playerId !== playerId));
  };

  const getPlayerPick = (playerId) => {
    return picks.find((p) => p.playerId === playerId);
  };

  const continueToReview = () => {
    if (picks.length !== 2) {
      Alert.alert('Invalid Selection', 'Please select exactly 2 players');
      return;
    }

    navigation.navigate('ContestReviewScreen', {
      contest,
      picks,
    });
  };

  const potentialPayout = contest.entryFee * 3;

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
        <Text style={styles.headerText}>Pick 2 Players</Text>
      </View>

      {/* Contest Info Banner */}
      <View style={styles.contestBanner}>
        <View style={styles.bannerRow}>
          <Text style={styles.bannerText}>{contest.title}</Text>
          <Text style={styles.bannerPrize}>${contest.prize} Prize</Text>
        </View>
        <View style={styles.bannerRow}>
          <Text style={styles.bannerSubtext}>Entry: ${contest.entryFee}</Text>
          <Text style={styles.bannerSubtext}>Win 3x (${potentialPayout})</Text>
        </View>
      </View>

      {/* Selected Picks Summary */}
      {picks.length > 0 && (
        <View style={styles.picksSummary}>
          <Text style={styles.picksSummaryTitle}>
            Your Picks ({picks.length}/2)
          </Text>
          {picks.map((pick, index) => (
            <View key={pick.playerId} style={styles.selectedPickCard}>
              <Image
                source={{ uri: pick.image }}
                style={styles.smallPlayerImage}
              />
              <View style={styles.pickInfo}>
                <Text style={styles.pickPlayerName}>{pick.playerName}</Text>
                <Text style={styles.pickPrediction}>
                  {pick.prediction === 'over' ? 'OVER' : 'UNDER'} {pick.line}{' '}
                  PTS
                </Text>
              </View>
              <TouchableOpacity onPress={() => removePick(pick.playerId)}>
                <Ionicons name='close-circle' size={24} color='#BA0C2F' />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Available Props */}
      <ScrollView contentContainerStyle={styles.propsContainer}>
        <Text style={styles.sectionTitle}>Available Players</Text>

        {props.map((prop) => {
          const playerPick = getPlayerPick(prop.playerId);
          const isSelected = !!playerPick;

          return (
            <View
              key={prop.playerId}
              style={[styles.propCard, isSelected && styles.selectedPropCard]}
            >
              <View style={styles.propHeader}>
                <Image
                  source={{ uri: prop.image }}
                  style={styles.playerImage}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{prop.playerName}</Text>
                  <Text style={styles.playerTeam}>{prop.team}</Text>
                  <Text style={styles.seasonAvg}>
                    Avg: {prop.seasonAvg} PPG
                  </Text>
                </View>
              </View>

              <View style={styles.propLine}>
                <Text style={styles.lineLabel}>POINT LINE</Text>
                <Text style={styles.lineValue}>{prop.line}</Text>
              </View>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[
                    styles.predictionButton,
                    styles.overButton,
                    playerPick?.prediction === 'over' &&
                      styles.selectedOverButton,
                  ]}
                  onPress={() => handlePickSelection(prop, 'over')}
                >
                  <Ionicons
                    name='arrow-up'
                    size={20}
                    color={
                      playerPick?.prediction === 'over' ? '#fff' : '#28a745'
                    }
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      playerPick?.prediction === 'over' &&
                        styles.selectedButtonText,
                    ]}
                  >
                    OVER
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.predictionButton,
                    styles.underButton,
                    playerPick?.prediction === 'under' &&
                      styles.selectedUnderButton,
                  ]}
                  onPress={() => handlePickSelection(prop, 'under')}
                >
                  <Ionicons
                    name='arrow-down'
                    size={20}
                    color={
                      playerPick?.prediction === 'under' ? '#fff' : '#BA0C2F'
                    }
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      playerPick?.prediction === 'under' &&
                        styles.selectedButtonText,
                    ]}
                  >
                    UNDER
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Continue Button */}
      {picks.length === 2 && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={continueToReview}
        >
          <Text style={styles.continueButtonText}>REVIEW PICKS</Text>
          <Ionicons name='arrow-forward' size={20} color='#fff' />
        </TouchableOpacity>
      )}
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
  contestBanner: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bannerText: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerPrize: {
    color: '#BA0C2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSubtext: {
    color: '#666',
    fontSize: 14,
  },
  picksSummary: {
    backgroundColor: 'rgba(186, 12, 47, 0.05)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  picksSummaryTitle: {
    color: '#1e3f6d',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedPickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#BA0C2F',
  },
  smallPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  pickInfo: {
    flex: 1,
  },
  pickPlayerName: {
    color: '#1e3f6d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickPrediction: {
    color: '#BA0C2F',
    fontSize: 12,
    fontWeight: '600',
  },
  propsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  propCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  selectedPropCard: {
    borderColor: '#BA0C2F',
    borderWidth: 2,
  },
  propHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerTeam: {
    color: '#666',
    fontSize: 14,
  },
  seasonAvg: {
    color: '#BA0C2F',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  propLine: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  lineLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  lineValue: {
    color: '#1e3f6d',
    fontSize: 28,
    fontWeight: 'bold',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  predictionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  overButton: {
    backgroundColor: '#fff',
    borderColor: '#28a745',
  },
  selectedOverButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  underButton: {
    backgroundColor: '#fff',
    borderColor: '#BA0C2F',
  },
  selectedUnderButton: {
    backgroundColor: '#BA0C2F',
    borderColor: '#BA0C2F',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  selectedButtonText: {
    color: '#fff',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#BA0C2F',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default PlayerSelection;
