import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Theme Constants - Character-for-character match with Wallet
const COLORS = {
  primary: '#1e3f6d',
  secondary: '#BA0C2F',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  lightGray: '#F5F5F7',
  cardBg: '#ffffff',
  cardBorder: '#E5E5EA',
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12, // Matched to Wallet
  lg: 20, // Matched to Wallet
  xl: 28, // Matched to Wallet
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6, // Matched to Wallet
    elevation: 3,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
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
      setUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        balance: 0,
      });
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
        style={[styles.entryCard, CARD_STYLES.shadow]}
        onPress={() =>
          navigation.navigate('EntryDetail', { entryId: entry.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.contestTitle}>
            {entry.contestTitle || 'Contest'}
          </Text>
          <Text
            style={[
              styles.statusText,
              {
                color: statusUpper === 'WON' ? COLORS.success : COLORS.primary,
              },
            ]}
          >
            {statusUpper}
          </Text>
        </View>
        <View style={styles.payoutInfo}>
          <Text style={styles.payoutLabel}>
            Payout:{' '}
            <Text style={styles.payoutValue}>
              {formatCurrency(entry.potentialPayout)}
            </Text>
          </Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* --- CLONED WALLET HEADER --- */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerSideItem} />
          <View style={styles.headerCenterItem}>
            <Text style={styles.headerTitle}>MY ENTRIES</Text>
          </View>
          <TouchableOpacity
            style={styles.headerSideItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name='person-circle-outline'
              size={32}
              color={COLORS.light}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Track your contests</Text>
      </LinearGradient>

      {/* Balance Card - Matched Overlap to Wallet */}
      <View style={[styles.balanceCard, CARD_STYLES.shadow]}>
        <View style={styles.balanceHeader}>
          <Ionicons name='wallet' size={24} color={COLORS.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(user?.balance)}
            </Text>
          </View>
        </View>
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
        <View style={styles.scrollContent}>
          {entries.length > 0 ? (
            entries.map(renderEntryCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name='trophy-outline' size={60} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No Entries Yet</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // EXACT WALLET HEADER CLONE
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenterItem: { flex: 3, alignItems: 'center' },
  headerSideItem: { flex: 1, alignItems: 'flex-end', minWidth: 40 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.light, fontSize: 20 },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Balance Card - Exact Wallet Overlap
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: -20, // Overlap the header exactly like Wallet
    borderRadius: 15,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center' },
  balanceLabel: { ...TYPOGRAPHY.small, color: COLORS.gray, fontSize: 10 },
  balanceAmount: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontSize: 24 },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  entryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contestTitle: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.dark },
  statusText: { fontWeight: '700', fontSize: 12 },
  payoutInfo: { borderTopWidth: 1, borderTopColor: '#F5F5F7', paddingTop: 8 },
  payoutLabel: { ...TYPOGRAPHY.small, color: COLORS.gray },
  payoutValue: { color: COLORS.dark, fontWeight: '700' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.gray, marginVertical: 20 },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: { color: COLORS.light, fontWeight: '700' },
});
