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
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// Theme Constants
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
  md: 12, // Matched to Wallet SPACING
  lg: 20, // Matched to Wallet SPACING
  xl: 28, // Matched to Wallet SPACING
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchContests();
  };

  const renderContestCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.contestCard, CARD_STYLES.shadow]}
      onPress={() => navigation.navigate('PlayerSelection', { contest: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.contestTitle}>{item.title || 'Contest'}</Text>
        <Text style={styles.prizeText}>Prize: ${item.prize}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.entryFeeText}>Entry: ${item.entryFee}</Text>
        <Ionicons name='chevron-forward' size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* --- HEADER MATCHED EXACTLY TO WALLET --- */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerSideItem} />

          <View style={styles.headerCenterItem}>
            <Text style={styles.headerTitle}>AVAILABLE CONTESTS</Text>
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
        <Text style={styles.headerSubtitle}>Pick your game</Text>
      </LinearGradient>

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
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Header Styles - EXACT COPY FROM WALLET
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
  headerCenterItem: {
    flex: 3,
    alignItems: 'center',
  },
  headerSideItem: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 40,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
    fontSize: 20, // Matched to Wallet
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4, // Matched to Wallet
  },

  // List Styles
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg, // Give some space since there's no balance card overlapping
  },
  contestCard: {
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
    marginBottom: 10,
  },
  contestTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  prizeText: { fontSize: 14, fontWeight: '600', color: COLORS.success },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  entryFeeText: { fontSize: 14, color: COLORS.gray },
});

export default ContestSelectionScreen;
