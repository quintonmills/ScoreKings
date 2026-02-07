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

// --- THEME CONSTANTS (Admin Dashboard Palette) ---
const COLORS = {
  primary: '#0A1F44', // Deep Navy
  accent: '#7D1324', // Maroon Stripe
  background: '#F0F2F5', // Admin gray background
  cardBg: '#ffffff',
  textMain: '#1A1A1A',
  textMuted: '#65676B',
  success: '#28A745',
  border: '#E4E6EB',
  light: '#ffffff',
};

const API_URL = 'https://server-core-1.onrender.com/api';

export default function MyContestsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async (userId = 1) => {
    try {
      const response = await fetch(`${API_URL}/me?userId=${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch user`);
      const userData = await response.json();
      setUser(userData);
      return userData.id;
    } catch (error) {
      setUser({ id: 1, name: 'Admin User', balance: 0 });
      return 1;
    }
  };

  const fetchEntries = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/entries`);
      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      setEntries([]);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const userId = await fetchUserData();
    if (userId) await fetchEntries(userId);
    setLoading(false);
    setRefreshing(false);
  }, []);

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
    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.entryCard}
        onPress={() =>
          navigation.navigate('EntryDetail', { entryId: entry.id })
        }
      >
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contestTitle}>
              {entry.contestTitle || 'Contest'}
            </Text>
            <Text style={styles.payoutLabel}>
              POTENTIAL PAYOUT:{' '}
              <Text style={styles.payoutValue}>
                {formatCurrency(entry.potentialPayout)}
              </Text>
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                borderColor:
                  statusUpper === 'WON' ? COLORS.success : COLORS.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusUpper === 'WON' ? COLORS.success : COLORS.textMuted,
                },
              ]}
            >
              {statusUpper}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* --- BOXY CENTERED ADMIN HEADER --- */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerSideItem} />
            <View style={styles.headerCenterItem}>
              <View style={styles.titleRow}>
                <Ionicons
                  name='basketball'
                  size={18}
                  color={COLORS.light}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.headerTitle}>MY ENTRIES</Text>
              </View>
              <Text style={styles.headerSubtitle}>ADMIN DASHBOARD VIEW</Text>
            </View>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons
                name='person-circle-outline'
                size={28}
                color={COLORS.light}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.headerAccentLine} />
      </View>

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
        {/* --- STATS SUMMARY BOX --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.statValue}>
              {formatCurrency(user?.balance)}
            </Text>
            <View style={styles.statIndicator} />
          </View>
        </View>

        <View style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>RECENT ENTRIES</Text>
          {entries.length > 0 ? (
            entries.map(renderEntryCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name='file-tray-outline'
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No entries found in system</Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Contests')}
              >
                <Text style={styles.browseButtonText}>CREATE NEW ENTRY</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // --- Boxy Header Styles ---
  headerWrapper: { backgroundColor: COLORS.primary, zIndex: 100 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  headerAccentLine: { height: 4, backgroundColor: COLORS.accent },

  // --- Admin Stats Box ---
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderRadius: 2, // Boxy
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  statIndicator: {
    height: 3,
    width: 30,
    backgroundColor: COLORS.accent,
    marginTop: 12,
  },

  // --- Entry Card Styles ---
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  entryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  payoutLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  payoutValue: { color: COLORS.textMain },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusText: { fontSize: 10, fontWeight: '800' },

  // --- Empty State ---
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginVertical: 16,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 2,
  },
  browseButtonText: { color: COLORS.light, fontWeight: '800', fontSize: 12 },
});
