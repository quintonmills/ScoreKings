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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// Theme Constants (same as MyContestsScreen)
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

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContests = async () => {
    try {
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

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getContestStatusConfig = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'UPCOMING':
        return { color: COLORS.warning, label: 'UPCOMING', bg: '#FFF3E0' };
      case 'LIVE':
        return { color: COLORS.success, label: 'LIVE', bg: '#E8F5E9' };
      case 'COMPLETED':
        return { color: COLORS.gray, label: 'COMPLETED', bg: '#F5F5F5' };
      default:
        return {
          color: COLORS.gray,
          label: statusUpper || 'UNKNOWN',
          bg: '#F5F5F5',
        };
    }
  };

  const renderContestCard = ({ item }) => {
    const statusConfig = getContestStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={[styles.contestCard, CARD_STYLES.shadow]}
        onPress={() =>
          navigation.navigate('PlayerSelection', { contest: item })
        }
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.contestTitle} numberOfLines={1}>
              {item.title || 'Contest'}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          {item.endTime && (
            <Text style={styles.contestDate}>
              Ends: {formatDate(item.endTime)}
            </Text>
          )}
        </View>

        {/* Contest Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>CONTEST DETAILS</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name='trophy-outline'
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PRIZE POOL</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(item.prize)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name='ticket-outline'
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ENTRY FEE</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(item.entryFee)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name='people-outline'
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PARTICIPANTS</Text>
                <Text style={styles.infoValue}>{item.participants || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Footer - Play Button */}
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardFooter}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={() =>
              navigation.navigate('PlayerSelection', { contest: item })
            }
          >
            <LinearGradient
              colors={[COLORS.primary, '#2A5298']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.playButtonText}>PLAY CONTEST</Text>
              <Ionicons
                name='arrow-forward'
                size={16}
                color='#FFF'
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading contests...</Text>
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
        <Text style={styles.headerTitle}>AVAILABLE CONTESTS</Text>
        <Text style={styles.headerSubtitle}>Pick your game</Text>
      </LinearGradient>

      {/* Main Content */}
      <FlatList
        data={contests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContestCard}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='trophy-outline' size={80} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Contests Available</Text>
            <Text style={styles.emptyDescription}>
              There are no active contests at the moment. Check back soon!
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons
                name='refresh'
                size={20}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.refreshButtonText}>REFRESH</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  contestCard: {
    backgroundColor: COLORS.cardBg,
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
  contestDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  infoSection: {
    padding: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    marginBottom: 2,
    textAlign: 'center',
  },
  infoValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  playButton: {
    width: '100%',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  playButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ContestSelectionScreen;
