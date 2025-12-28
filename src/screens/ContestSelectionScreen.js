import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContests = async () => {
    try {
      // FIX: Added /api to match your server.ts route
      const response = await fetch(`${API_URL}/contests`);
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchContests();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContests();
  };

  const renderContestCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlayerSelection', { contest: item })}
    >
      {/* TOP SECTION: Title and Prize */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.contestTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.contestSubtitle}>2-Pick Prediction</Text>
        </View>
        <View style={styles.prizeBadge}>
          <Text style={styles.prizeLabel}>WIN</Text>
          <Text style={styles.prizeAmount}>${item.prize}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* MIDDLE SECTION: Stats Grid to prevent text smashing */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name='ticket-outline' size={14} color='#666' />
          <Text style={styles.footerText}>${item.entryFee}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name='people-outline' size={14} color='#666' />
          <Text style={styles.footerText}>{item.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name='time-outline' size={14} color='#BA0C2F' />
          <Text style={[styles.footerText, { color: '#BA0C2F' }]}>
            {item.endTime}
          </Text>
        </View>
      </View>

      {/* BOTTOM SECTION: Play Button */}
      <View style={styles.cardAction}>
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>PLAY CONTEST</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No live contests found.</Text>
            <Text style={styles.emptySubtext}>Check back soon for more!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  welcomeText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mainHeading: { color: '#1e3f6d', fontSize: 24, fontWeight: '900' },
  listPadding: { padding: 15, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contestTitle: { fontSize: 18, fontWeight: '900', color: '#1e3f6d' },
  contestSubtitle: {
    fontSize: 12,
    color: '#BA0C2F',
    fontWeight: '700',
    marginTop: 2,
  },
  prizeBadge: {
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  prizeLabel: { fontSize: 9, fontWeight: 'bold', color: '#BA0C2F' },
  prizeAmount: { fontSize: 16, fontWeight: '900', color: '#BA0C2F' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 10,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 12, color: '#444', fontWeight: '700' },
  cardAction: { marginTop: 5 },
  playButton: {
    backgroundColor: '#1e3f6d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 6,
  },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1e3f6d' },
  emptySubtext: { color: '#666', marginTop: 5 },
});

export default ContestSelectionScreen;
