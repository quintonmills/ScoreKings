import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlayerSelection = ({ navigation }) => {
  // Sample player data - replace with your actual data source
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedStat, setSelectedStat] = useState('ppg');

  // Fetch players from backend
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/players');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
        Alert.alert('Error', 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading players...</Text>
      </View>
    );
  }

  const togglePlayerSelection = (player) => {
    if (selectedPlayers.some((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else if (selectedPlayers.length < 2) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const startComparison = () => {
    if (selectedPlayers.length === 2) {
      navigation.navigate('ContestReviewScreen', {
        // Changed from 'Comparison' to 'Payment'
        player1: selectedPlayers[0],
        player2: selectedPlayers[1],
        stat: selectedStat,
        entryFee: 10.0, // Example fee - adjust as needed
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color='hashtag#fff' />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select 2 Players</Text>
      </View>
      <View style={styles.statSelector}>
        <Text style={styles.statTitle}>Compare by:</Text>
        <TouchableOpacity
          style={[
            styles.statButton,
            selectedStat === 'ppg' && styles.selectedStat,
          ]}
          onPress={() => setSelectedStat('ppg')}
        >
          <Text style={styles.statText}>PPG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statButton,
            selectedStat === 'apg' && styles.selectedStat,
          ]}
          onPress={() => setSelectedStat('apg')}
        >
          <Text style={styles.statText}>APG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statButton,
            selectedStat === 'rpg' && styles.selectedStat,
          ]}
          onPress={() => setSelectedStat('rpg')}
        >
          <Text style={styles.statText}>RPG</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.playersContainer}>
        {players.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerCard,
              selectedPlayers.some((p) => p.id === player.id) &&
                styles.selectedPlayer,
            ]}
            onPress={() => togglePlayerSelection(player)}
          >
            <Image source={{ uri: player.image }} style={styles.playerImage} />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerTeam}>{player.team}</Text>
              <Text style={styles.playerStat}>
                {player[selectedStat]} {selectedStat.toUpperCase()}
              </Text>
            </View>
            {selectedPlayers.some((p) => p.id === player.id) && (
              <View style={styles.selectionBadge}>
                <Text style={styles.badgeText}>
                  {selectedPlayers.findIndex((p) => p.id === player.id) + 1}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedPlayers.length == 2 && (
        <TouchableOpacity
          style={styles.compareButton}
          onPress={startComparison}
        >
          <Text style={styles.compareButtonText}>Start Comparison</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  statSelector: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  statTitle: {
    marginRight: 10,
    fontSize: 16,
    color: '#555',
  },
  statButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  selectedStat: {
    backgroundColor: '#BA0C2F',
  },
  statText: {
    color: '#333',
    fontWeight: '500',
  },
  playersContainer: {
    paddingBottom: 80,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPlayer: {
    borderWidth: 2,
    borderColor: '#BA0C2F',
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  playerTeam: {
    fontSize: 14,
    color: '#666',
  },
  playerStat: {
    fontSize: 16,
    color: '#BA0C2F',
    fontWeight: 'bold',
    marginTop: 5,
  },
  selectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BA0C2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  compareButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#BA0C2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#1e3f6d',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#BA0C2F',
    paddingTop: 50,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default PlayerSelection;
