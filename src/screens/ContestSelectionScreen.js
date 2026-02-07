import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// --- THEME CONSTANTS (Admin Dashboard Palette) ---
const COLORS = {
  primary: '#0A1F44', // Deep Navy Admin Header
  accent: '#7D1324', // Maroon Accent Stripe
  background: '#F0F2F5', // Light Grayish Web Background
  cardBg: '#ffffff',
  textMain: '#1A1A1A',
  textMuted: '#65676B',
  success: '#28A745',
  border: '#E4E6EB',
  light: '#ffffff',
};

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
      style={styles.contestCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PlayerSelection', { contest: item })}
    >
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.contestTitle}>{item.title || 'Contest'}</Text>
          <Text style={styles.entryFeeText}>Entry Fee: ${item.entryFee}</Text>
        </View>
        <View style={styles.prizeBadge}>
          <Text style={styles.prizeText}>${item.prize} Prize</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>
          STATUS: <Text style={{ color: COLORS.success }}>ACTIVE</Text>
        </Text>
        <Ionicons name='chevron-forward' size={18} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <View style={styles.container}>
        <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

        {/* --- BOXY ADMIN HEADER --- */}
        <View style={styles.headerWrapper}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              {/* Left Spacer for centering */}
              <View style={styles.headerSideItem} />

              {/* Centered Title Group */}
              <View style={styles.headerCenterItem}>
                <View style={styles.titleRow}>
                  <Ionicons
                    name='basketball'
                    size={18}
                    color={COLORS.light}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.headerTitle}>Available Contests</Text>
                </View>
                <Text style={styles.headerSubtitle}>Pick your game</Text>
              </View>

              {/* Profile Action */}
              <TouchableOpacity
                style={styles.headerSideItem}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Ionicons
                  name={showDropdown ? 'close' : 'person-circle-outline'}
                  size={28}
                  color={COLORS.light}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {/* Maroon stripe from the web dashboard */}
          <View style={styles.headerAccentLine} />
        </View>

        {/* --- DROPDOWN MENU --- */}
        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                navigation.navigate('Profile');
              }}
            >
              <Ionicons
                name='person-outline'
                size={20}
                color={COLORS.textMain}
              />
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
              <Ionicons
                name='settings-outline'
                size={20}
                color={COLORS.textMain}
              />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- LIST CONTENT --- */}
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
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // --- Header Styles ---
  headerWrapper: {
    backgroundColor: COLORS.primary,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerSideItem: {
    width: 40,
    alignItems: 'center',
  },
  headerCenterItem: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    letterSpacing: 0.5,
  },
  headerAccentLine: {
    height: 4,
    backgroundColor: COLORS.accent,
  },

  // --- Dropdown Styles ---
  dropdownContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 105 : 95,
    right: 16,
    backgroundColor: COLORS.light,
    width: 180,
    borderRadius: 4,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    marginLeft: 12,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  // --- Contest List Styles ---
  scrollContent: {
    padding: 16,
  },
  contestCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 2, // Very boxy web-look
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  entryFeeText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  prizeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  prizeText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFBFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
});

export default ContestSelectionScreen;
