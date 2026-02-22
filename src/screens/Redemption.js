import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api'; // Ensure this matches your wallet's URL

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

const PRIZES = [
  { id: '1', title: '$25 Amazon Gift Card', cost: 2500, icon: 'logo-amazon' },
  { id: '2', title: '$50 Apple Gift Card', cost: 5000, icon: 'logo-apple' },
  { id: '3', title: 'ScoreKings Hoodie', cost: 7500, icon: 'shirt-outline' },
];

export default function RedemptionScreen({ setUser, navigation }) {
  const [localUser, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the absolute "source of truth" balance when modal opens
  const fetchBalance = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const idToFetch = storedId || '1';

      const response = await fetch(`${API_URL}/me?userId=${idToFetch}`);
      const userData = await response.json();

      setLocalUser(userData);
      // Sync the global app state if setUser was passed in
      if (setUser) setUser(userData);
    } catch (error) {
      console.error('Redeem Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleRedeem = (prize) => {
    const balance = localUser?.balance ?? 0;

    if (balance < prize.cost) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${prize.cost - balance} more credits for this prize.`,
      );
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem ${prize.cost} credits for ${prize.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', onPress: () => processRedemption(prize) },
      ],
    );
  };

  const processRedemption = async (prize) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localUser.id,
          prizeTitle: prize.title,
          cost: prize.cost,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Your prize request has been sent for verification.',
        );

        // 2. Update local state and global state with NEW balance from server
        const updatedUserData = { ...localUser, balance: data.newBalance };
        setLocalUser(updatedUserData);
        if (setUser) setUser(updatedUserData);
      } else {
        Alert.alert('Error', data.error || 'Redemption failed');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPrizeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.prizeCard}
      onPress={() => handleRedeem(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={28} color={COLORS.primary} />
      </View>
      <View style={styles.prizeInfo}>
        <Text style={styles.prizeTitle}>{item.title}</Text>
        <Text style={styles.prizeCost}>{item.cost} Credits</Text>
      </View>
      <Ionicons name='chevron-forward' size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <View style={styles.modalHeader}>
        <View style={styles.pullHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Redeem Prizes</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name='close-circle' size={28} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !localUser ? (
          <ActivityIndicator
            size='large'
            color={COLORS.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>
                ${(localUser?.balance ?? 0).toFixed(2)}
              </Text>
            </View>

            <Text style={styles.sectionLabel}>AVAILABLE REWARDS</Text>

            <FlatList
              data={PRIZES}
              keyExtractor={(item) => item.id}
              renderItem={renderPrizeItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  modalHeader: {
    backgroundColor: COLORS.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  pullHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D1D6',
    borderRadius: 3,
    marginBottom: 15,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.dark },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 16 },
  balanceSection: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  prizeCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeInfo: { flex: 1, marginLeft: 16 },
  prizeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  prizeCost: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
});
