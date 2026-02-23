import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIG: Automatically switches between local testing and production
// config/api.js or at the top of your screens
const LOCAL_IP = '10.0.0.253';
const PORT = '4000';

// This logic says: If I'm in development AND I'm not an Apple Reviewer, try local.
// However, the SAFEST way for Apple is to use a fallback.
export const API_URL = 'https://server-core-1.onrender.com/api';
const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  success: '#28A745',
  danger: '#FF3B30',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

export default function MyContestsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const userId = storedId || '1';

      const response = await fetch(`${API_URL}/me?userId=${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch user`);
      const userData = await response.json();
      setUser(userData);
      return userData.id;
    } catch (error) {
      console.error('User fetch error:', error);
      return null;
    }
  };

  const fetchEntries = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/entries`);
      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Entries fetch error:', error);
      setEntries([]);
    }
  };

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const userId = await fetchUserData();
      if (userId) {
        await fetchEntries(userId);
      }
    } catch (error) {
      console.error('General load error:', error);
    } finally {
      // Guarantees the spinner stops regardless of success or failure
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;

  const renderEntryCard = (entry) => {
    const statusUpper = entry.status?.toUpperCase() || 'ACTIVE';
    const isWon = statusUpper === 'WON';

    return (
      <TouchableOpacity
        key={entry.id}
        activeOpacity={0.8}
        style={styles.entryCard}
        onPress={() =>
          navigation.navigate('EntryDetail', { entryId: entry.id })
        }
      >
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contestTitle} numberOfLines={1}>
              {entry.contestTitle || 'CONTEST ENTRY'}
            </Text>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>POTENTIAL PAYOUT</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(entry.potentialPayout)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isWon
                  ? 'rgba(40, 167, 69, 0.1)'
                  : COLORS.lightGray,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isWon ? COLORS.success : COLORS.gray },
              ]}
            >
              {statusUpper}
            </Text>
          </View>
          <Ionicons
            name='chevron-forward'
            size={16}
            color={COLORS.cardBorder}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.gray }}>
          Connecting to ScoreKings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerSideItem} />
            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>MY ENTRIES</Text>
              <Text style={styles.headerSubtitle}>LIVE PORTFOLIO</Text>
            </View>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons
                name='person-circle-outline'
                size={28}
                color={COLORS.light}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#ffffff', '#fcfcfc']}
            style={styles.statBox}
          >
            <View style={styles.walletHeader}>
              <Text style={styles.statLabel}>VIRTUAL WALLET BALANCE</Text>
              <Ionicons name='wallet-outline' size={16} color={COLORS.gray} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(user?.balance)}
            </Text>
            <View style={styles.accentLine} />
          </LinearGradient>
        </View>

        <View style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          {entries.length > 0 ? (
            entries.map(renderEntryCard)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name='receipt-outline'
                  size={40}
                  color={COLORS.gray}
                />
              </View>
              <Text style={styles.emptyTitle}>No active entries found</Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Contests')}
              >
                <Text style={styles.browseButtonText}>BROWSE CONTESTS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 4,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.light,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 3,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  statValue: { fontSize: 32, fontWeight: '900', color: COLORS.dark },
  accentLine: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.primary,
    marginTop: 15,
    borderRadius: 2,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 1,
  },
  entryCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardContent: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  contestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  payoutRow: { flexDirection: 'row', alignItems: 'center' },
  payoutLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '700',
    marginRight: 6,
  },
  payoutValue: { fontSize: 13, color: COLORS.primary, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 24,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
});
