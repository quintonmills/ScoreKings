import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

export default function MyContestsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const userId = 1;
  const fetchData = async () => {
    try {
      console.log('--- Fetching Data ---');
      // REMOVED /api because it's already in your API_URL variable
      const [entriesRes, userRes] = await Promise.all([
        fetch(`${API_URL}/users/${userId}/entries`),
        fetch(`${API_URL}/me`),
      ]);

      const entriesData = await entriesRes.json();
      const userData = await userRes.json();

      console.log('Entries Received:', entriesData);

      setEntries(Array.isArray(entriesData) ? entriesData : []);
      setUser(userData);
    } catch (err) {
      // This will now log clearly if it fails
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh when navigating back to screen (e.g. from Success Screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- DERIVED STATE (No duplicates here) ---
  const activeEntriesList = entries.filter(
    (e) =>
      e.status?.toLowerCase() === 'active' ||
      e.status?.toLowerCase() === 'pending'
  );

  const completedEntriesList = entries.filter(
    (e) =>
      e.status?.toLowerCase() === 'won' || e.status?.toLowerCase() === 'lost'
  );

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'won') return '#28a745';
    if (s === 'lost') return '#BA0C2F';
    return '#1e3f6d';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#BA0C2F' />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MY ENTRIES</Text>
      </View>

      {user && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Ionicons name='wallet-outline' size={24} color='#1e3f6d' />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Virtual Balance</Text>
              <Text style={styles.balanceAmount}>${user.balance}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Section */}
        {activeEntriesList.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                ACTIVE ENTRIES ({activeEntriesList.length})
              </Text>
            </View>
            {activeEntriesList.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() =>
                  navigation.navigate('EntryDetail', { entryId: entry.id })
                }
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.contestName}>{entry.contestTitle}</Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(entry.status) },
                    ]}
                  >
                    {entry.status?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.picksSection}>
                  {entry.picks?.map((pick, i) => (
                    <Text key={i} style={styles.pickText}>
                      • {pick.playerName}: {pick.prediction} {pick.line} PTS
                    </Text>
                  ))}
                </View>
                <View style={styles.entryFooter}>
                  <Text style={styles.footerLabel}>
                    Entry: ${entry.entryFee}
                  </Text>
                  <Text style={styles.potentialWin}>
                    Win: ${entry.potentialPayout}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Completed Section */}
        {completedEntriesList.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>COMPLETED</Text>
            </View>
            {completedEntriesList.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryCard, { opacity: 0.8 }]}
                onPress={() =>
                  navigation.navigate('EntryDetail', { entryId: entry.id })
                }
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.contestName}>{entry.contestTitle}</Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(entry.status) },
                    ]}
                  >
                    {entry.status?.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name='basketball-outline' size={60} color='#ccc' />
            <Text style={styles.emptyStateTitle}>No Entries Found</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Contests')}
            >
              <Text style={styles.browseButtonText}>BROWSE CONTESTS</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1e3f6d', paddingTop: 50, paddingBottom: 16 },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceInfo: { marginLeft: 12 },
  balanceLabel: { color: '#666', fontSize: 12 },
  balanceAmount: { color: '#1e3f6d', fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  sectionHeader: { marginVertical: 12 },
  sectionTitle: { color: '#1e3f6d', fontWeight: 'bold', fontSize: 14 },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contestName: { fontWeight: 'bold', fontSize: 16, flex: 1 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  picksSection: { marginBottom: 10 },
  pickText: { fontSize: 14, color: '#444', marginBottom: 4 },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  footerLabel: { color: '#666' },
  potentialWin: { color: '#BA0C2F', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyStateTitle: { fontSize: 18, color: '#666', marginTop: 10 },
  browseButton: {
    backgroundColor: '#BA0C2F',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  browseButtonText: { color: '#fff', fontWeight: 'bold' },
});
