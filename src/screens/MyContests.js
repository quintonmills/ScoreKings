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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const { width } = Dimensions.get('window');

// Theme Constants
const COLORS = {
  primary: '#1e3f6d', // Dark blue
  secondary: '#BA0C2F', // Red
  success: '#34C759', // Green
  warning: '#FF9500', // Orange
  danger: '#FF3B30', // Red
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
  md: 16,
  lg: 24,
  xl: 32,
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
};

export default function MyContestsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Group entries by status
  const groupedEntries = entries.reduce((groups, entry) => {
    const status = entry.status?.toUpperCase() || 'ACTIVE';
    if (!groups[status]) groups[status] = [];
    groups[status].push(entry);
    return groups;
  }, {});

  // Fetch user data
  const fetchUserData = async (userId = 1) => {
    try {
      const response = await fetch(`${API_URL}/me?userId=${userId}`);
      const userData = await response.json();
      setUser(userData);
      return userData.id;
    } catch (error) {
      console.error('Error fetching user:', error);
      return 1;
    }
  };

  // Fetch contest entries
  const fetchEntries = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/entries`);
      if (!response.ok)
        throw new Error(`Failed to fetch entries: ${response.status}`);
      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      Alert.alert(
        'Error',
        'Could not load your entries. Please check your connection.'
      );
      setEntries([]);
    }
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await fetchUserData();
      if (userId) await fetchEntries(userId);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  // Format status text with colors
  const getStatusConfig = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
        return { color: COLORS.success, label: 'ACTIVE', bg: '#E8F5E9' };
      case 'WON':
        return { color: COLORS.success, label: 'WON', bg: '#E8F5E9' };
      case 'LOST':
        return { color: COLORS.danger, label: 'LOST', bg: '#FFEBEE' };
      case 'PENDING':
        return { color: COLORS.warning, label: 'PENDING', bg: '#FFF3E0' };
      default:
        return {
          color: COLORS.gray,
          label: statusUpper || 'UNKNOWN',
          bg: '#F5F5F5',
        };
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle entry press
  const handleEntryPress = (entry) => {
    navigation.navigate('EntryDetail', { entryId: entry.id });
  };

  // Render entry card
  const renderEntryCard = (entry) => {
    const statusConfig = getStatusConfig(entry.status);

    return (
      <TouchableOpacity
        key={entry.id}
        style={[styles.entryCard, CARD_STYLES.shadow]}
        onPress={() => handleEntryPress(entry)}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.contestTitle} numberOfLines={1}>
              {entry.contestTitle || 'Contest'}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
        </View>

        {/* Picks Preview */}
        {entry.picks && entry.picks.length > 0 && (
          <View style={styles.picksSection}>
            <Text style={styles.sectionLabel}>YOUR PICKS</Text>
            {entry.picks.slice(0, 3).map((pick, index) => (
              <View key={index} style={styles.pickRow}>
                <View style={styles.pickInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {pick.playerName}
                  </Text>
                  <View style={styles.predictionChip}>
                    <Text style={styles.predictionText}>
                      {pick.prediction} {pick.line}
                    </Text>
                  </View>
                </View>
                <Text style={styles.teamText}>{pick.team}</Text>
              </View>
            ))}
            {entry.picks.length > 3 && (
              <Text style={styles.morePicks}>
                +{entry.picks.length - 3} more picks
              </Text>
            )}
          </View>
        )}

        {/* Card Footer - Payout Info */}
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardFooter}
        >
          <View style={styles.payoutInfo}>
            <View style={styles.payoutItem}>
              <Text style={styles.payoutLabel}>ENTRY</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(entry.entryFee)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.payoutItem}>
              <Text style={styles.payoutLabel}>TO WIN</Text>
              <Text style={[styles.payoutValue, styles.payoutWin]}>
                {formatCurrency(entry.potentialPayout)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render status section
  const renderStatusSection = (title, entries, status) => {
    if (!entries || entries.length === 0) return null;

    return (
      <View style={styles.statusSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{entries.length}</Text>
        </View>
        {entries.map(renderEntryCard)}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>MY ENTRIES</Text>
        <Text style={styles.headerSubtitle}>Track your contests</Text>
      </LinearGradient>

      {/* User Balance Card */}
      {user && (
        <View style={[styles.balanceCard, CARD_STYLES.shadow]}>
          <View style={styles.balanceHeader}>
            <Ionicons name='person-circle' size={24} color={COLORS.primary} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
            </View>
          </View>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(user.balance)}
            </Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Active Entries */}
        {renderStatusSection(
          'ACTIVE CONTESTS',
          groupedEntries['ACTIVE'],
          'ACTIVE'
        )}

        {/* Pending Entries */}
        {renderStatusSection('PENDING', groupedEntries['PENDING'], 'PENDING')}

        {/* Won Entries */}
        {renderStatusSection('WON CONTESTS', groupedEntries['WON'], 'WON')}

        {/* Lost Entries */}
        {renderStatusSection('LOST CONTESTS', groupedEntries['LOST'], 'LOST')}

        {/* Empty State */}
        {entries.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name='trophy-outline' size={80} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Entries Yet</Text>
            <Text style={styles.emptyDescription}>
              You haven't entered any contests. Join one to see your entries
              here!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Contests')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.browseButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.browseButtonText}>BROWSE CONTESTS</Text>
                <Ionicons
                  name='arrow-forward'
                  size={16}
                  color='#FFF'
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Refresh Prompt */}
        {entries.length > 0 && (
          <TouchableOpacity style={styles.refreshPrompt} onPress={onRefresh}>
            <Ionicons name='refresh-circle' size={20} color={COLORS.primary} />
            <Text style={styles.refreshText}>Pull down to refresh</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userInfo: {
    marginLeft: SPACING.sm,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
  },
  userEmail: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  statusSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
  },
  sectionCount: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  entryCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  contestTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  entryDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  picksSection: {
    padding: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
    marginRight: SPACING.sm,
  },
  predictionChip: {
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
  },
  predictionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  morePicks: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  cardFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  payoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  payoutItem: {
    alignItems: 'center',
    flex: 1,
  },
  payoutLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  payoutValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    fontWeight: '700',
  },
  payoutWin: {
    color: COLORS.success,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.cardBorder,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.dark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  browseButton: {
    width: '100%',
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  browseButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  refreshPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  refreshText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
});
