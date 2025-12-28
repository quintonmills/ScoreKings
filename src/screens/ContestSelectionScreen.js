import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live contests from your Render database
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch(`${API_URL}/contests`);
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const renderContestCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlayerSelection', { contest: item })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.contestTitle}>{item.title}</Text>
          <Text style={styles.contestSubtitle}>2-Pick Prediction</Text>
        </View>
        <View style={styles.prizeBadge}>
          <Text style={styles.prizeLabel}>WIN</Text>
          <Text style={styles.prizeAmount}>${item.prize}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Ionicons name='ticket-outline' size={16} color='#666' />
          <Text style={styles.footerText}>Entry: ${item.entryFee}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name='time-outline' size={16} color='#666' />
          <Text style={styles.footerText}>{item.endTime}</Text>
        </View>
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>PLAY</Text>
          <Ionicons name='chevron-forward' size={14} color='#fff' />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#BA0C2F' />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Welcome, MVP</Text>
        <Text style={styles.mainHeading}>AVAILABLE CONTESTS</Text>
      </View>

      <FlatList
        data={contests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContestCard}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No live contests found.</Text>
            <Text style={styles.emptySubtext}>
              Check back soon for more projections!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7', // Light professional grey
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  welcomeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  mainHeading: {
    color: '#1e3f6d',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  listPadding: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3f6d',
  },
  contestSubtitle: {
    fontSize: 13,
    color: '#BA0C2F', // Your brand red
    fontWeight: '700',
    marginTop: 2,
  },
  prizeBadge: {
    backgroundColor: 'rgba(186, 12, 47, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  prizeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#BA0C2F',
  },
  prizeAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#BA0C2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E5E9',
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  playButton: {
    backgroundColor: '#1e3f6d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 4,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3f6d',
  },
  emptySubtext: {
    color: '#666',
    marginTop: 5,
  },
});

export default ContestSelectionScreen;
