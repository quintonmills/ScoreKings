import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

export default function MyContestsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    // Only show the main loader if we aren't pull-to-refreshing
    if (!refreshing) setLoading(true);

    try {
      console.log('Fetching from:', `${API_URL}/me`);

      // 1. Get User Profile
      const userRes = await fetch(`${API_URL}/me`);
      if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
      const userData = await userRes.json();
      setUser(userData);

      // 2. Get User Entries
      if (userData?.id) {
        const entriesRes = await fetch(
          `${API_URL}/users/${userData.id}/entries`
        );
        const entriesData = await entriesRes.json();
        setEntries(Array.isArray(entriesData) ? entriesData : []);
      }
    } catch (err) {
      console.error('MyContests Fetch Error:', err);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when the screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#BA0C2F' />
        <Text style={{ marginTop: 10 }}>Loading your entries...</Text>
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
              <Text style={styles.balanceLabel}>User ID: {user.id}</Text>
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
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() =>
                navigation.navigate('EntryDetail', { entryId: entry.id })
              }
            >
              <View style={styles.entryHeader}>
                <Text style={styles.contestName}>
                  {entry.contestTitle || 'Contest'}
                </Text>
                <Text style={styles.statusText}>
                  {entry.status?.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name='basketball-outline' size={60} color='#ccc' />
            <Text style={styles.emptyStateTitle}>No Entries Found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1e3f6d', paddingTop: 60, paddingBottom: 20 },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceCard: {
    padding: 15,
    backgroundColor: '#f0f2f5',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceInfo: { marginLeft: 10 },
  balanceLabel: { fontSize: 12, color: '#666' },
  balanceAmount: { fontSize: 20, fontWeight: 'bold', color: '#1e3f6d' },
  scrollContent: { padding: 15 },
  entryCard: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  contestName: { fontWeight: 'bold' },
  statusText: { color: '#BA0C2F', fontWeight: 'bold', fontSize: 12 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateTitle: { color: '#999', marginTop: 10 },
});
