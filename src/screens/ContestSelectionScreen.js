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
  TouchableWithoutFeedback,
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
  md: 12,
  lg: 20,
  xl: 28,
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Higher elevation for the dropdown
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
};

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown State

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
      style={[
        styles.contestCard,
        { shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
      ]}
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
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content' />

        {/* --- HEADER --- */}
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
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Ionicons
                name={showDropdown ? 'close-circle' : 'person-circle-outline'}
                size={32}
                color={COLORS.light}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Pick your game</Text>
        </LinearGradient>

        {/* --- DROPDOWN MENU --- */}
        {showDropdown && (
          <View style={[styles.dropdownContainer, CARD_STYLES.shadow]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                navigation.navigate('Profile');
              }}
            >
              <Ionicons name='person-outline' size={20} color={COLORS.dark} />
              <Text style={styles.dropdownText}>My Profile</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                navigation.navigate('Settings');
              }}
            >
              <Ionicons name='settings-outline' size={20} color={COLORS.dark} />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
          </View>
        )}

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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
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
    fontSize: 20,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Dropdown Styles
  dropdownContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 100, // Adjusts so it sits right under the header
    right: 20,
    backgroundColor: COLORS.light,
    width: 180,
    borderRadius: 12,
    zIndex: 1000,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    marginLeft: 10,
    color: COLORS.dark,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 10,
  },

  // List Styles
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
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
