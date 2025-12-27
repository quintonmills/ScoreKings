import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator, // Ensure this is imported
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import Header from '../components/Header';

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: API_URL already includes /api, so we just call /contests
    fetch(`${API_URL}/contests`)
      .then((res) => res.json())
      .then((data) => {
        setContests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const navigateToPlayerSelection = (contest) => {
    navigation.navigate('PlayerSelection', { contest });
  };

  // --- MATCHING LOADING STYLE ---
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#BA0C2F' />
        <Text style={styles.loadingText}>Fetching active contests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title='MY CONTESTS' navigation={navigation} />

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name='trophy-outline' size={20} color='#1e3f6d' />
          <Text style={styles.sectionTitle}>ACTIVE CONTESTS</Text>
        </View>

        {contests.map((contest) => (
          <TouchableOpacity
            key={contest.id}
            style={styles.contestCard}
            onPress={() => navigateToPlayerSelection(contest)}
          >
            <View style={styles.contestHeader}>
              <Text style={styles.contestTitle}>{contest.title}</Text>
              <Text style={styles.contestPrize}>${contest.prize} Prize</Text>
            </View>

            <View style={styles.contestDetails}>
              <View style={styles.detailRow}>
                <Ionicons name='pricetag-outline' size={16} color='#1e3f6d' />
                <Text style={styles.detailText}>
                  Entry: ${contest.entryFee}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='people-outline' size={16} color='#1e3f6d' />
                <Text style={styles.detailText}>
                  {contest.participants} Joined
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name='time-outline' size={16} color='#1e3f6d' />
                <Text style={styles.detailText}>Ends {contest.endTime}</Text>
              </View>
            </View>

            <View style={styles.playersRow}>
              {contest.players?.map((player, index) => (
                <View key={index} style={styles.playerPill}>
                  <Text style={styles.playerPillText}>{player}</Text>
                </View>
              ))}
            </View>

            <View style={styles.joinButton}>
              <Text style={styles.joinButtonText}>SELECT PLAYERS</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Ionicons name='checkmark-done-outline' size={20} color='#1e3f6d' />
          <Text style={styles.sectionTitle}>COMPLETED CONTESTS</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name='trophy' size={40} color='#1e3f6d' />
          <Text style={styles.emptyStateText}>No completed contests yet</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Exact match to your MyContests screen styling
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    color: '#1e3f6d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 2,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contestTitle: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contestPrize: {
    color: '#BA0C2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  playersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  playerPill: {
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  playerPillText: {
    color: '#1e3f6d',
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: '#BA0C2F',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default ContestSelectionScreen;
